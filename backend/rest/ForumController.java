package pt.uc.dei.projfinal.rest;

import java.util.Collection;
import java.util.List;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
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

import pt.uc.dei.projfinal.dto.DTOAssociation;
import pt.uc.dei.projfinal.dto.DTOForum;
import pt.uc.dei.projfinal.dto.DTOInterest;
import pt.uc.dei.projfinal.dto.DTOSkill;
import pt.uc.dei.projfinal.dto.DTOUser;
import pt.uc.dei.projfinal.entity.Forum;
import pt.uc.dei.projfinal.entity.Forum.ForumType;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.User.UserType;
import pt.uc.dei.projfinal.service.ForumService;
import pt.uc.dei.projfinal.service.UserService;
import pt.uc.dei.projfinal.utilities.ActionLog;
import pt.uc.dei.projfinal.utilities.LogGenerator;

@Path("/forum")
public class ForumController {

	@Inject
	ForumService forumService;
	@Inject
	UserService userService;
	ActionLog actionLog;
	@Context
	private HttpServletRequest request;

	// criar forum
	// precisamos do user a receber o Forum, pois o user logado pode ser um admin
	// O mesmo ocorre com skills, interesses e projetos, pois pode ser um admin
	// logado
	// está sem o gerador de Log
	@Path("/new")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response createNewForum(DTOForum dtoForum) {

		if (dtoForum == null) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			int idNewForum = forumService.createForum(dtoForum, loggedUser);
			LogGenerator.generateAndWriteLog(request, actionLog.CREATE_FORUM);
			return Response.ok(idNewForum).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}

	}

	// endpoint para adicionar forum aos favoritos do utilizador
	@Path("/likes/{id}")
	@POST
	public Response likeForum(@PathParam("id") String forumId) {

		if (forumId == null || forumId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			forumService.addForumToUserFavorites(loggedUser, Integer.parseInt(forumId));
			LogGenerator.generateAndWriteLog(request, actionLog.FAVORITED_FORUM);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para remover forum dos favoritos do utilizador
	// user do path é logado - user do header é o que terá o favorito removido
	@Path("/removeLikes/{id}")
	@POST
	public Response removeLikeForum(@PathParam("id") String forumId) {

		if (forumId == null || forumId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			forumService.removeForumToUserFavorites(loggedUser, Integer.parseInt(forumId));
			LogGenerator.generateAndWriteLog(request, actionLog.REMOVE_FAVORITE_FORUM);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para votar no forum
	@Path("/voted/{id}")
	@POST
	public Response voteForum(@PathParam("id") String forumId) {

		if (forumId == null || forumId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			forumService.voteInForum(loggedUser, Integer.parseInt(forumId));
			LogGenerator.generateAndWriteLog(request, actionLog.VOTED_FORUM);

			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para remover o voto no forum
	@Path("/RemoveVote/{id}")
	@POST
	public Response removeVoteForum(@PathParam("id") String forumId) {

		if (forumId == null || forumId.isEmpty()) {
			return Response.status(401).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			forumService.removevoteInForum(loggedUser, Integer.parseInt(forumId));
			LogGenerator.generateAndWriteLog(request, actionLog.REMOVE_VOTE_FORUM);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}

	}

	// endpoint para user mostrar interesse em trabalhar naquela ideia/necessidade
	@Path("/wishesToWork/{id}")
	@POST
	public Response haveInterestInWorking(@PathParam("id") String forumId) {

		if (forumId == null || forumId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			forumService.showInterestInWorking(loggedUser, Integer.parseInt(forumId));
			LogGenerator.generateAndWriteLog(request, actionLog.SHOW_INTEREST_TO_WORK_IN_FORUM);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para o user retirar o interesse em trabalhar naquela
	// ideia/necessidade
	@Path("/removeWish/{id}")
	@POST
	public Response removeInterestInWork(@PathParam("id") String forumId) {

		if (forumId == null || forumId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			forumService.removeInterestInWorking(loggedUser, Integer.parseInt(forumId));
			LogGenerator.generateAndWriteLog(request, actionLog.REMOVE_INTEREST_TO_WORK_IN_FORUM);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para associar uma ideia/necessidade a outra ideia/necessidade
	// firstId é o id do forum original
	// secondId é o id do forum a ser adicionado
	@Path("/associate/{firstId}/with/{secondId}")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response associateForums(@PathParam("firstId") String firstId, @PathParam("secondId") String secondId,
			DTOAssociation dto) {

		System.out.println("associateForums - controller - com os ids forum original " + firstId + " id 2 to add "
				+ secondId + " dto " + dto);

		if (firstId == null || firstId.isEmpty() || secondId == null || secondId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			Forum forum1 = forumService.findForum(Integer.parseInt(firstId));
			Forum forum2 = forumService.findForum(Integer.parseInt(secondId));

			if (forum1.isSoftDelete() || forum2.isSoftDelete()) {
				return Response.status(497).build();
			}

			if (forumService.checkAuthorization(loggedUser, forum1)) {
				forumService.associateForums(Integer.parseInt(firstId), Integer.parseInt(secondId), dto);
				LogGenerator.generateAndWriteLog(request, actionLog.ASSOCIATE_FORUM_WITH_FORUM);
				return Response.ok().build();
			}

			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para desassociar uma ideia/necessidade de uma ideia/necessidade
	@Path("/desassociate/{id}")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response desassociateForums(@PathParam("id") String id) {

		if (id == null || id.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (forumService.desassociateForums(Integer.parseInt(id), loggedUser)) {
				LogGenerator.generateAndWriteLog(request, actionLog.DISASSOCIATE_FORUM_FROM_FORUM);
				return Response.ok().build();
			}

			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para editar associação uma ideia/necessidade de uma
	// ideia/necessidade
	@Path("/edit/{id}/association")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response editAssociationDescription(@PathParam("id") String id, DTOAssociation dto) {

		if (id == null || id.isEmpty() || dto == null) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (forumService.editAssociation(Integer.parseInt(id), dto, emailSession)) {
				LogGenerator.generateAndWriteLog(request, actionLog.EDIT_ASSOCIATION_BETWEEN_FORUMS);
				return Response.ok().build();
			}

			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para editar forum
	@Path("/edit/{id}")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response editForum(@PathParam("id") String id, DTOForum dto) {

		if (id == null || id.isEmpty() || dto == null) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			Forum forum = forumService.findForum(Integer.parseInt(id));

			if (forumService.checkAuthorization(loggedUser, forum) && !forum.isSoftDelete()) {

				forumService.editForum(dto, forum);
				LogGenerator.generateAndWriteLog(request, actionLog.EDIT_FORUM);
				return Response.ok().build();
			}

			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para obter lista de forums que este user favoritou
	@Path("/favorites")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getFavoriteList() {

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOForum> list = forumService.listFavoriteForum(loggedUser);
			LogGenerator.generateAndWriteLog(request, actionLog.LIST_FAVORITES_FORUM);
			return Response.ok(list).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para obter a lista de ideias/necessidades que o user registou
	@Path("/registered")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getRegisteredList(@HeaderParam("email") String emailUser) {

		if (emailUser == null || emailUser.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToView = userService.findUser(emailUser);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToView == null
					|| userToView.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOForum> list = forumService.listRegisteredForum(userToView);
			LogGenerator.generateAndWriteLog(request, actionLog.LIST_USER_REGISTERED_FORUMS);
			return Response.ok(list).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para obter a lista de associações de um determinado forum
	// lista de foruns associados a este forum
	@Path("/{id}/get/Association")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAssociation(@PathParam("id") String idForum) {

		if (idForum == null || idForum.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOAssociation> list = forumService.getAssociationList(Integer.parseInt(idForum));
			LogGenerator.generateAndWriteLog(request, actionLog.LIST_ASSOCIATIONS);
			return Response.ok(list).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// 6.5.3 - get de todas as ideias E necessidades registadas no sistema
	@Path("/search/all")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAllForums() {

		// Qualquer user pode aceder a lista de todos os Foruns do sistema
		try {
			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null) {
				return Response.status(403).build();
			}

			Collection<DTOForum> allForumsDto = forumService.getAllSystemForums();
			LogGenerator.generateAndWriteLog(request, actionLog.SEARCH_ALL_FORUMS);
			return Response.ok(allForumsDto).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// 6.5.3 - Deve existir uma página, acessível aos utilizadores, com a lista de
	// todas as Ideias e Necessidades registadas
	// no sistema. Esta listagem deve poder ser filtrada por categorias
	// (Ideias/Necessidades)
	// get filtrar por ideias
	@Path("/filter/idea")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response filterByIdea() {

		// Qualquer user pode aceder a lista de todos os Foruns do sistema
		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null) {
				return Response.status(403).build();
			}

			Collection<DTOForum> allIdeasDto = forumService.getForumByType(ForumType.IDEA);

			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_BY_IDEA);
			return Response.ok(allIdeasDto).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// get filtrar por necessidades
	@Path("/filter/necessity")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response filterByNecessity() {

		// Qualquer user pode aceder a lista de todos os Foruns do sistema
		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null) {
				return Response.status(403).build();
			}

			Collection<DTOForum> allIdeasDto = forumService.getForumByType(ForumType.NECESSITY);

			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_BY_IDEA);
			return Response.ok(allIdeasDto).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// get forum por id - traz também a quantidade de votos
	@Path("/with/{id}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getForumById(@PathParam("id") String idForum) {

		if (idForum == null || idForum.isEmpty()) {
			return Response.status(406).build();
		}

		// Qualquer user pode aceder a um determinado forum
		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null) {
				return Response.status(403).build();
			}

			DTOForum dto = forumService.getForumById(Integer.parseInt(idForum), loggedUser);
			LogGenerator.generateAndWriteLog(request, actionLog.GET_FORUM_BY_ID);

			if (dto == null) {
				return Response.status(496).build();
			}

			return Response.ok(dto).build();

		} catch (Exception e) {

			return Response.status(401).build();
		}
	}

	// get buscar users com disponibilidade para trabalhar em uma Ideia/necessidade
	@Path("/users/available/{id}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getUsersWhoHaveInterest(@PathParam("id") String idForum) {

		if (idForum == null || idForum.isEmpty()) {
			return Response.status(406).build();
		}

		// Qualquer user pode aceder a um determinado forum
		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null) {
				return Response.status(403).build();
			}

			Collection<DTOUser> dtos = forumService.getUsersWhoHaveInterest(Integer.parseInt(idForum));

			LogGenerator.generateAndWriteLog(request, actionLog.GET_USERS_AVAILABLE_TO_WORK);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// Buscar/filtrar ideias favoritas de um determinado user
	// Para o item 6.4.3
	@Path("/favorites/ideas")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response filterByUserFavoriteIdeas() {

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOForum> dtos = forumService.filterByUserFavorite(emailSession, ForumType.IDEA);

			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_FORUM_BY_USER_FAVORITE_IDEAS);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// Buscar/filtrar necessidades favoritas de um determinado user
	// Para o item 6.4.3
	@Path("/favorites/necessities")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response filterByUserFavoriteNecessity() {

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOForum> dtos = forumService.filterByUserFavorite(emailSession, ForumType.NECESSITY);

			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_FORUM_BY_USER_FAVORITE_IDEAS);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// get das necessidades registadas pelo user
	// será usado para os filtros do item 6.4
	// No header estará o user de quem estou vendo a area pessoal
	@Path("/registered/necessities")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response listRegisteredNecessities(@HeaderParam("email") String userEmail) {

		if (userEmail == null || userEmail.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToSee = userService.findUser(userEmail);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToSee == null
					|| userToSee.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOForum> dtos = forumService.filterByUserRegistered(userEmail, ForumType.NECESSITY);

			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_FORUM_BY_USER_REGISTERED_NECESSITY);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// get das ideias registadas pelo user
	// será usado para os filtros do item 6.4
	// No header estará o user de quem estou vendo a area pessoal
	@Path("/registered/ideas")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response listRegisteredIdeas(@HeaderParam("email") String userEmail) {

		if (userEmail == null || userEmail.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToSee = userService.findUser(userEmail);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToSee == null
					|| userToSee.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOForum> dtos = forumService.filterByUserRegistered(userEmail, ForumType.IDEA);

			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_FORUM_BY_USER_REGISTERED_IDEA);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// busca ativa dos interesses associados aos forums registados por aquele user
	// para os filtros do item 6.4
	// No header estará o user de quem estou vendo a area pessoal
	@Path("{type}/interests/registered/user/by/{searchKey}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response searchInterestsByForumUser(@HeaderParam("email") String emailUserPersonalArea,
			@PathParam("searchKey") String searchKey, @PathParam("type") String typeForum) {

		if (emailUserPersonalArea == null || emailUserPersonalArea.isEmpty() || searchKey == null || searchKey.isEmpty()
				|| typeForum == null || typeForum.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToSee = userService.findUser(emailUserPersonalArea);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToSee == null
					|| userToSee.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			List<DTOInterest> dtos = forumService.searchInterestsByForumUser(emailUserPersonalArea, searchKey,
					typeForum);

			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_FORUM_USER_REGISTERED_BY_INTEREST);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// b das skills associadas aos forums registados por aquele user
	// será usado para os filtros do item 6.4
	// No header estará o user de quem estou vendo a area pessoal
	@Path("{type}/skills/registered/user/by/{searchKey}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response searchSkillsByForumUser(@HeaderParam("email") String emailUserPersonalArea,
			@PathParam("searchKey") String searchKey, @PathParam("type") String typeForum) {

		if (emailUserPersonalArea == null || emailUserPersonalArea.isEmpty() || searchKey == null || searchKey.isEmpty()
				|| typeForum == null || typeForum.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToSee = userService.findUser(emailUserPersonalArea);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToSee == null
					|| userToSee.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			List<DTOSkill> dtos = forumService.searchSkillsByForumUser(emailUserPersonalArea, searchKey, typeForum);

			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_FORUM_USER_REGISTERED_BY_SKILL);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	@Path("/skills/associated/{forumId}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response listSkillsAssociatedWithForum(@PathParam("forumId") String forumId) {
		if (forumId == null || forumId.isEmpty()) {
			return Response.status(406).build();
		}
		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			List<DTOSkill> dtos = forumService.listAllSkillsOfForum(Integer.parseInt(forumId));

			LogGenerator.generateAndWriteLog(request, actionLog.GET_FORUM_SKILL_LIST);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	@Path("/interests/associated/{forumId}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response listInterestsAssociatedWithForum(@PathParam("forumId") String forumId) {
		if (forumId == null || forumId.isEmpty()) {
			return Response.status(406).build();
		}
		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			List<DTOInterest> dtos = forumService.listAllInterestsOfForum(Integer.parseInt(forumId));

			LogGenerator.generateAndWriteLog(request, actionLog.GET_FORUM_INTEREST_LIST);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para apagar um forum
	@Path("delete/{id}")
	@POST
	public Response deleteForum(@PathParam("id") String forumId) {

		if (forumId == null || forumId.isEmpty()) {
			return Response.status(406).build();
		}
		try {
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Forum forum = forumService.findForum(Integer.parseInt(forumId));

			if (forumService.checkAuthorization(loggedUser, forum)) {
				//
				if (forumService.deleteForum(forum)) {
					LogGenerator.generateAndWriteLog(request, actionLog.DELETE_PROJECT);
					return Response.ok().build();
				} else {
					// não pode apagar o forum porque é o único (ativo) que se encontra associado ao
					// projeto
					return Response.status(485).build();
				}
			}

			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// item 6.5.3
	// filtrar todos os forums ou todoas ideias ou todas necessidades
	// por skills e ou interesses
	// Recebemos por path SE É IDEA, NECESSITY OU ALL
	@Path("/filter/skill/andOr/interest/{category}")
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public Response filterBySkillAndOrInterest(@PathParam("category") String categoryToSearch, String idsJson) {

		/*
		 * Postman: { "idsSkills":[7,6], " ":[5,3] }
		 */

		if (idsJson == null || idsJson.isEmpty() || categoryToSearch == null || categoryToSearch.isEmpty()) {
			return Response.status(406).build();
		}

		// Qualquer user pode aceder a um determinado forum
		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null) {
				return Response.status(403).build();
			}

			Collection<DTOForum> dtos = forumService.filterBySkillsAndOrInterests(idsJson, categoryToSearch);

			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_FORUM_BY_SKILL_OR_INTEREST);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// TODO
	// item 6.4
	// filtrar forums registados pelo user por skills e ou interesses
	// user: é o email do ownerPage
	@Path("/{user}/filter/skill/and/or/interest/{category}")
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public Response filterRegisteredBySkillAndOrInterest(@PathParam("user") String emailOwnerPage,
			@PathParam("category") String categoryToSearch, String idsJson) {

		/*
		 * Postman: { "idsSkills":[7,6], "idsInterest":[5,3] }
		 */

		// category: necessity ou idea

		if (idsJson == null || idsJson.isEmpty() || emailOwnerPage == null || emailOwnerPage.isEmpty()
				|| categoryToSearch == null || categoryToSearch.isEmpty()) {
			return Response.status(406).build();
		}

		// Qualquer user pode aceder a um determinado forum
		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userOwnerPage = userService.findUser(emailOwnerPage);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userOwnerPage == null
					|| userOwnerPage.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOForum> dtos = forumService.filterRegisteredBySkillsAndOrInterests(emailOwnerPage, idsJson,
					categoryToSearch);

			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_USER_REGISTERED_FORUM_BY_SKILL_AND_OR_INTEREST);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// busca ativa das ideias/necessidades
	// type deve ser em letras pequenas (necessity/idea)
	@Path("/search/{searchKey}/if/{type}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getForumBySearchKey(@PathParam("searchKey") String searchKey, @PathParam("type") String type) {

		if (searchKey == null || searchKey.isEmpty() || type == null || type.isEmpty()) {
			return Response.status(406).build();
		}
		try {
			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOForum> skillsDto = forumService.searchForumBySearchKey(searchKey, type);
			LogGenerator.generateAndWriteLog(request, actionLog.ACTIVE_FORUM_SEARCH);
			return Response.ok(skillsDto).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para verificar se o user tem autorização para editar o forum
	@Path("/has/auth/{id}")
	@POST
	@Produces(MediaType.TEXT_PLAIN)
	public Response checkAuthorizationToEditForum(@PathParam("id") String idForum) {

		if (idForum == null || idForum.isEmpty()) {
			return Response.status(406).build();
		}
		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null) {
				return Response.status(403).build();
			}

			Forum forum = forumService.findForum(Integer.parseInt(idForum));
			boolean hasAuthorization = forumService.checkAuthorization(loggedUser, forum);

			LogGenerator.generateAndWriteLog(request, actionLog.SEE_IF_USER_HAS_AUTHORIZATION);
			return Response.ok(hasAuthorization).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}
}
