package pt.uc.dei.projfinal.rest;

import java.util.List;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.json.JSONObject;

import pt.uc.dei.projfinal.dto.DTOUser;
import pt.uc.dei.projfinal.dto.DTOUserComplete;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.User.UserType;
import pt.uc.dei.projfinal.service.UserService;
import pt.uc.dei.projfinal.utilities.ActionLog;
import pt.uc.dei.projfinal.utilities.LogGenerator;

@Path("/users")
public class UserController {

	@Inject
	UserService userService;
	ActionLog actionLog;

	// Esta anotação é usada para injetar informações em uma classe
	// * campo, propriedade do bean ou parâmetro do método.
	@Context
	private HttpServletRequest request;

	// registo quando antes de qualquer login na front end
	@Path("/register")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response addUser(DTOUserComplete userDto) {

		if (userDto == null) {
			return Response.status(406).build();
		}

		try {
			User user = userService.findUser(userDto.getEmail());
			if(user != null) {
				return Response.status(421).build();
			}
			userService.createUser(userDto);
			request.getSession().setAttribute("user", userDto.getEmail());

			LogGenerator.generateAndWriteLog(request, actionLog.USER_REGISTER);
			request.getSession().removeAttribute("user");
			request.getSession().invalidate();
			return Response.ok().build();
		} catch (Exception e) {
			return Response.status(401).build();
		}

	}

	// endpoint para promover utilizador visitante a utilizador padrão
	// No front quando validar registo vamos direcionar o user para a tela de login
	@Path("promote/{token}/standard")
	@POST
	public Response promoteUserToStandard(@PathParam("token") String temporaryToken) {

		if (temporaryToken == null || temporaryToken.isEmpty()) {
			return Response.status(406).build();
		}

		try {
			User user = userService.findUserByToken(temporaryToken);

			HttpSession session = request.getSession();
			session.setAttribute("user", user.getEmail());

			userService.promoteToStandardUser(user);

			LogGenerator.generateAndWriteLog(request, actionLog.PROMOTE_USER_TO_STANDARD);
			request.getSession().removeAttribute("user");
			request.getSession().invalidate();
			return Response.ok().build();
		} catch (Exception e) {
			return Response.status(401).build();
		}

	}

	// endpoint para enviar email para fazer reset da password
	@Path("/email/{user}/resetpwd")
	@POST
	public Response SendEmailResetPassword(@PathParam("user") String email) {

		if (email == null || email.isEmpty()) {
			return Response.status(406).build();
		}

		try {
			HttpSession session = request.getSession();
			session.setAttribute("user", email);

			if (userService.sendEmailToResetPassword(email)) {
				LogGenerator.generateAndWriteLog(request, actionLog.SEND_EMAIL_RESET_PASSWORD);
				// Retiro os dados da sessão, pois user não estaria logado
				request.getSession().removeAttribute("user");
				request.getSession().invalidate();
				return Response.ok().build();

			}
			// se não existe um user com o email recebido pelo endpoint
			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}

	}

	// endpoint para o utilizador poder fazer o login
	@Path("/login")
	@POST
	public Response login(@HeaderParam("email") String email, @HeaderParam("password") String password) {

		if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			if (userService.login(email, password)) {
				HttpSession session = request.getSession();
				session.setAttribute("user", email);
				// setting session to expiry
				int timeout = userService.getTimeoutForSession();
				System.out.println("timeout" + timeout);
				session.setMaxInactiveInterval(timeout * 60);
				LogGenerator.generateAndWriteLog(request, actionLog.LOGIN);
				return Response.ok().build();
			} else {
				return Response.status(403).build();
			}

		} catch (Exception e) {
			System.out.println("catch");
			return Response.status(401).build();
		}

	}

	// endpoint para fazer de fato o reset da password
	// No front quando usar clicar em "fazer reset" pedimos o email, e enviamos o
	// sendEmailResetPassword
	// No link do email, o user é redirecionado a uma página para digitar e
	// confirmar a nova password
	// Para localizar o user e validar o mesmo, usamos o token provisorio enviado
	// junto com o email
	@Path("/reset/{token}/password")
	@POST
	public Response doResetPassword(@PathParam("token") String temporaryToken, String newPassword) {

		// Postmand:{"password": "123"}

		if (temporaryToken == null || temporaryToken.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// Já verifico se existe na BD user com aquele token- user validado
			User user = userService.findUserByToken(temporaryToken);
			// foi colocado somente para o log poder pegar o email do author da ação
			request.getSession().setAttribute("user", user.getEmail());
			userService.doResetPassword(user, newPassword);
			LogGenerator.generateAndWriteLog(request, actionLog.RESET_PASSWORD);

			// Retiro os dados da sessão, pois user não estaria logado
			request.getSession().removeAttribute("user");
			request.getSession().invalidate();
			return Response.ok().build();
		} catch (Exception e) {
			return Response.status(401).build();
		}

	}

	// endpoint para fazer o logout
	@Path("/logout")
	@POST
	public Response logout() {

		try {

			// Aqui teria de percorrer o array de Sessions e procurar a session com atribute
			// user que tenha o email do user que vai fazer logout
			HttpSession session = request.getSession();

			LogGenerator.generateAndWriteLog(request, actionLog.LOGOUT);
			session.invalidate();
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// Método para alterar a visibilidade da area pessoal de um user
	@Path("/change/visibility")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response changeUserVisibility(@HeaderParam("email") String emailUserToEdited, String visibility) {

		if (emailUserToEdited == null || emailUserToEdited.isEmpty() || visibility == null) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));

			User loggedUser = userService.findUser(emailSession);
			User userToEdit = userService.findUser(emailUserToEdited);

			if (userService.checkAuthToEdit(loggedUser, userToEdit)) {

				userService.changeVisibility(userToEdit, visibility);
				LogGenerator.generateAndWriteLog(request, actionLog.CHANGE_PERSONAL_AREA_VISIBILITY);
				return Response.ok().build();
			}

			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// Método para user editar perfil
	// o email é o do User que irá ser editado
	@Path("/edit/profile/{email}")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response editUserPerfil(@PathParam("email") String emailUserToEdited, DTOUserComplete userDto) {

		if (emailUserToEdited == null || emailUserToEdited.isEmpty() || userDto == null) {
			return Response.status(406).build();
		}

		try {
			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));

			User loggedUser = userService.findUser(emailSession);
			User userToEdit = userService.findUser(emailUserToEdited);

			if (loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)
					|| loggedUser.getEmail().equals(userToEdit.getEmail())) {

				userService.editUserProfile(userDto, userToEdit);
				LogGenerator.generateAndWriteLog(request, actionLog.USER_EDIT_PROFILE);
				return Response.ok().build();
			}

			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para verificar se o utilizador tem autorização para editar o perfil
	@Path("/has/auth/{user}")
	@GET
	@Produces(MediaType.TEXT_PLAIN)
	public Response verifyAuth(@PathParam("user") String user) {
		if (user == null || user.isEmpty()) {
			return Response.status(406).build();
		}
		try {
			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));

			User loggedUser = userService.findUser(emailSession);
			User userToEdit = userService.findUser(user);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToEdit == null
					|| userToEdit.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			boolean auth = userService.checkAuthToEdit(loggedUser, userToEdit);
			LogGenerator.generateAndWriteLog(request, actionLog.SEE_IF_USER_HAS_AUTHORIZATION);
			return Response.ok(auth).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	@Path("/change/password")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response changePassword(String json) {
		//
		if (json == null || json.isEmpty()) {
			return Response.status(406).build();
		}
		//
		try {
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));

			User loggedUser = userService.findUser(emailSession);

			if (loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			userService.changePassword(loggedUser, json);
			LogGenerator.generateAndWriteLog(request, actionLog.CHANGE_PASSWORD);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// Listar user buscando por email
	@Path("/search/by/email")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getUserByEmail(@HeaderParam("email") String emailUserToFound) {

		if (emailUserToFound == null || emailUserToFound.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));

			User loggedUser = userService.findUser(emailSession);
			User userToFind = userService.findUser(emailUserToFound);

			if (loggedUser.getTypeUser().equals(UserType.VISITOR) || loggedUser == null || userToFind == null) {
				return Response.status(403).build();
			}
			DTOUserComplete userFound = userService.getUserByEmail(userToFind);
			LogGenerator.generateAndWriteLog(request, actionLog.SEARCH_USER_BYEMAIL);
			return Response.ok(userFound).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// Listar user buscando por email
	// vem por PAth o user logado
	@Path("/search/simple/by/email")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getUserByEmailSimple(@HeaderParam("email") String emailUserToFound) {

		if (emailUserToFound == null || emailUserToFound.isEmpty()) {
			return Response.status(46).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));

			User loggedUser = userService.findUser(emailSession);
			User userToFind = userService.findUser(emailUserToFound);

			if (loggedUser.getTypeUser().equals(UserType.VISITOR) || loggedUser == null || userToFind == null) {
				return Response.status(403).build();
			}
			DTOUser userFound = userService.getUserByEmailSimple(emailUserToFound);
			LogGenerator.generateAndWriteLog(request, actionLog.SEARCH_USER_BYEMAIL);
			return Response.ok(userFound).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	@Path("/users/who/can/view/{user}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getUsersWhoCanView(@PathParam("user") String user) {

		if (user == null || user.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));

			User loggedUser = userService.findUser(emailSession);
			User userToFind = userService.findUser(user);

			if (loggedUser.getTypeUser().equals(UserType.VISITOR) || userToFind.getTypeUser().equals(UserType.VISITOR)
					|| loggedUser == null || userToFind == null) {
				return Response.status(403).build();
			}

			List<DTOUser> dtoList = userService.getUsersWhoCanViewList(user);
			LogGenerator.generateAndWriteLog(request, actionLog.GET_USER_VIEWER_LIST);
			return Response.ok(dtoList).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// get do user com aquela sessão
	@Path("/get")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getUser() {

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));

			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null) {
				return Response.status(403).build();
			}
			DTOUser userFound = userService.getUserByEmailSimple(emailSession);
			LogGenerator.generateAndWriteLog(request, actionLog.GET_USER_WITH_SESSION);
			return Response.ok(userFound).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para gerir o timeout da session
	@Path("/manage/timeout")
	@POST
	public Response manageSessionTimeout(@HeaderParam("timeout") String timeout) {
		if (timeout == null || timeout.isEmpty()) {
			return Response.status(406).build();
		}

		try {
			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));

			User loggedUser = userService.findUser(emailSession);

			if (loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {
				userService.manageSessionTimeout(Integer.parseInt(timeout));
				LogGenerator.generateAndWriteLog(request, actionLog.CHANGE_SESSION_TIMEOUT);

				return Response.ok().build();
			}

			return Response.status(403).build();

		} catch (Exception e) {

			return Response.status(401).build();
		}
	}

	@Path("/get/current/timeout")
	@GET
	@Produces(MediaType.TEXT_PLAIN)
	public Response getTimeout() {
		try {
			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));

			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null) {
				return Response.status(403).build();
			}

			JSONObject obj = userService.getTimeOutObj();
			LogGenerator.generateAndWriteLog(request, actionLog.GET_SESSION_TIMEOUT);
			return Response.ok(obj).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// método para promover um user normal a um administrador do sistema
	@Path("/promote/to/admin")
	@POST
	public Response upgradeUserToSystemAdmin(@HeaderParam("email") String userEmail) {
		//
		if (userEmail == null || userEmail.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));

			User loggedUser = userService.findUser(emailSession);
			User userToChange = userService.findUser(userEmail);

			if (loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)
					&& userToChange.getTypeUser().equals(UserType.STANDARD)) {
				userService.upgradeUserToAdmin(userToChange);
				LogGenerator.generateAndWriteLog(request, actionLog.PROMOTE_STANDARD_USER_TO_SYSTEM_ADMIN);

				return Response.ok().build();
			}

			return Response.status(403).build();

		} catch (Exception e) {

			return Response.status(401).build();
		}
	}

	// método para despromover um admin para um user normal
	@Path("/dispromote/admin")
	@POST
	public Response dispromoteAdminToUserStandard(@HeaderParam("email") String userEmail) {
		if (userEmail == null || userEmail.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));

			User loggedUser = userService.findUser(emailSession);
			User userToChange = userService.findUser(userEmail);

			if (loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)
					&& userToChange.getTypeUser().equals(UserType.ADMINISTRATOR)) {

				userService.dispromoteAdminToUserStandard(userToChange);
				LogGenerator.generateAndWriteLog(request, actionLog.PROMOTE_SYSTEM_ADMIN_TO_STANDARD_USER);

				return Response.ok().build();
			}

			return Response.status(403).build();

		} catch (Exception e) {

			return Response.status(401).build();
		}
	}

	///////////////////////////////////////////////////////////////
	// Métodos a serem usados no caso de visibilidade especifica
//////////////////////////////////////////////////////////////////

	// Listar users pesquisados por nome/alcunha
	@Path("/search/{searchKey}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getUsersByNameOrNickname(@PathParam("searchKey") String searchKey) {

		if (searchKey == null || searchKey.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User user = userService.findUser(emailSession);

			if (user == null || user.getTypeUser().equals(UserType.VISITOR)) {
				System.out.println("null");
				return Response.status(403).build();
			}

			List<DTOUser> usersDto = userService.getUsersByNameOrNickname(searchKey);
			LogGenerator.generateAndWriteLog(request, actionLog.USER_SEARCH);
			return Response.ok(usersDto).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// Filtra a lista de visualizadores especificos de um determinado user
	// email do path é o email do user dono da area pessoal
	// NOTA: cuidado, o admin pode estar vendo a lista de outro user
	@Path("/filter/{email}/viewers/by/{searchKey}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response filterEspecificListByNameOrNickname(@PathParam("searchKey") String searchKey,
			@PathParam("email") String emailOwnerPage) {

		if (searchKey == null || searchKey.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (!emailOwnerPage.equals(emailSession) && !loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {
				return Response.status(403).build();
			}

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			List<DTOUser> usersDto = userService.filterUsersByNameOrNickname(searchKey, emailOwnerPage);
			LogGenerator.generateAndWriteLog(request, actionLog.USER_SEARCH);
			return Response.ok(usersDto).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// Busca ativa por workplace todos os registados no sistema
	@Path("/search/active/{workplace}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response activeSearchByWorkplace(@PathParam("workplace") String workplace) {

		if (workplace == null || workplace.isEmpty()) {
			return Response.status(401).build();
		}

		//
		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User user = userService.findUser(emailSession);

			if (user == null || user.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			List<String> workplaceList = userService.activeSearchByWorkplace(workplace);
			LogGenerator.generateAndWriteLog(request, actionLog.ACTIVE_SEARCH_BY_WORKPLACE);
			return Response.ok(workplaceList).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// Caso o user não selecione nenhum workplace enviamos a palavra empty pelo
	// front
	@Path("/add/viewerList/group/{workplace}")
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public Response addUserToViewerListBySkillsAndInterestsAndWorkplace(@HeaderParam("email") String emailUserToEdit,
			String idsJson, @PathParam("workplace") String workplace) {

		/*
		 * Postman: { "idsSkills":[7,6], "idsInterest":[5,3]} Caso não venha nenhum id,
		 * mandar do front para cá um array vazio []
		 */

		if (workplace == null || workplace.isEmpty()) {
			return Response.status(406).build();
		}

		try {
			// o email da session é o email do user logado naquele momento
			User loggedUser = userService.findUser(String.valueOf(request.getSession().getAttribute("user")));

			// user que vai ter um viewer adicionado a sua lista
			User userToEdit = userService.findUser(emailUserToEdit);

			if (userService.checkAuthToEdit(loggedUser, userToEdit)) {// está autorizado

				userService.addViewerListSupport(userToEdit, idsJson, workplace);
				LogGenerator.generateAndWriteLog(request, actionLog.ADD_USER_VIEWER_LIST);
				return Response.ok().build();
			}

			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// ADMIN DO SISTEMA E O PRÓPRIO PODEM EDITAR ISTO
	// Método para adicionar user a lista de visualizadores permitidos, caso o user
	// tenha sua área pessoal como "especifica" e resolver escolher os users um a um
	// o email do header é o do User que irá sofrer a alteração
	// o email do path é o do user a ser adicionado na lista de visualizadores
	@Path("/add/viewerList/oneByOne/{email}")
	@POST
	public Response addUserToViewerListOneByOne(@HeaderParam("email") String emailUserToEdit,
			@PathParam("email") String emailToAdd) {

		if (emailUserToEdit == null || emailUserToEdit.isEmpty() || emailToAdd == null || emailToAdd.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));

			User loggedUser = userService.findUser(emailSession);
			User userToEdit = userService.findUser(emailUserToEdit);
			User userToAdd = userService.findUser(emailToAdd);

			if (!userService.hasAuthorizationToEdit(loggedUser, userToEdit)
					|| userToAdd.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (userService.addUserToViewerListOneByOne(userToEdit, userToAdd)) {
				LogGenerator.generateAndWriteLog(request, actionLog.ADD_USER_VIEWER_LIST);
				return Response.ok().build();
			}
			// user já existe na lista atual de visualizadores
			return Response.status(450).build();

		} catch (Exception e) {
			System.out.println("catch controller");
			return Response.status(401).build();
		}
	}

	// Método para remover user da lista de visualizadores permitidos, caso o user
	// tenha sua área pessoal como "especifica"
	// o email do header é o do User que irá sofrer a alteração
	// o email do path é o do user a ser removido da lista de visualizadores
	@Path("/remove/viewerList/{email}")
	@POST
	public Response removeUserToViewerList(@HeaderParam("email") String emailUserToEdited,
			@PathParam("email") String emailToRemove) {

		if (emailUserToEdited == null || emailUserToEdited.isEmpty() || emailToRemove == null
				|| emailToRemove.isEmpty()) {
			return Response.status(401).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));

			User loggedUser = userService.findUser(emailSession);
			User userToEdit = userService.findUser(emailUserToEdited);
			User userToRemove = userService.findUser(emailToRemove);

			// Se é um admin OU dono da area pessoal && se dono da area pessoal tem
			// visibilidade especifica
			if (userService.hasAuthorizationToEdit(loggedUser, userToEdit)) {

				userService.removeUserToViewerList(userToEdit, userToRemove);
				LogGenerator.generateAndWriteLog(request, actionLog.REMOVE_USER_VIEWER_LIST);
				return Response.ok().build();
			}

			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}

	}

	// Método para remover TODOS os users da viewer list
	// o email do header é o do User que irá sofrer a alteração
	@Path("/remove/all/viewerList")
	@POST
	public Response removeAllUsersToViewerList(@HeaderParam("email") String emailUserToEdited) {

		if (emailUserToEdited == null || emailUserToEdited.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToEdit = userService.findUser(emailUserToEdited);

			if (userService.hasAuthorizationToEdit(loggedUser, userToEdit)) {

				userService.removeAllUsersToViewerList(userToEdit);
				LogGenerator.generateAndWriteLog(request, actionLog.REMOVE_ALL_USERS_VIEWER_LIST);
				return Response.ok().build();
			}

			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}

	}

	// Método para remover TODOS os users de um certo workplace da viewer list
	// o email do header é o do User que irá sofrer a alteração
	@Path("/remove/viewerList/{email}/by/{workplace}")
	@POST
	public Response removeUsersToViewerListByWorkplace(@PathParam("email") String emailUserToEdit,
			@PathParam("workplace") String workplace) {

		if (emailUserToEdit == null || emailUserToEdit.isEmpty()) {
			return Response.status(401).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToEdit = userService.findUser(emailUserToEdit);

			if (userService.hasAuthorizationToEdit(loggedUser, userToEdit)) {
				System.out.println("user autorizado");
				userService.removeUsersToViewerListByWorkplace(userToEdit, workplace);
				LogGenerator.generateAndWriteLog(request, actionLog.REMOVE_USER_VIEWER_LIST);
				return Response.ok().build();
			}

			return Response.status(403).build();

		} catch (Exception e) {
			System.out.println("catch controller");
			return Response.status(401).build();
		}

	}

	// Busca ativa por workplace - somente os locais de trabalho respetivos
	// a viewer list de um user
	// No path é o user dono da viewerList
	@Path("/search/active/viewers/{workplace}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response activeSearchByWorkplaceViewerList(@PathParam("workplace") String workplace,
			@HeaderParam("email") String emailUserToEdit) {

		if (workplace == null || workplace.isEmpty()) {
			return Response.status(401).build();
		}

		//
		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User user = userService.findUser(emailSession);
			User userToEdit = userService.findUser(emailUserToEdit);

			if (user == null || user.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (!user.getEmail().equals(userToEdit.getEmail()) && !user.equals(UserType.ADMINISTRATOR)) {
				return Response.status(403).build();
			}

			// activeSearchByWorkplaceViewerList
			List<String> workplaceList = userService.activeSearchByWorkplaceViewerList(workplace, emailUserToEdit);
			LogGenerator.generateAndWriteLog(request, actionLog.ACTIVE_SEARCH_BY_WORKPLACE);
			return Response.ok(workplaceList).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	@Path("/all")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAllUsers() {
		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User user = userService.findUser(emailSession);
			if (user == null || user.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			List<DTOUser> dtoList = userService.getAll();
			LogGenerator.generateAndWriteLog(request, actionLog.GET_ALL_USERS);
			return Response.ok(dtoList).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}
}
