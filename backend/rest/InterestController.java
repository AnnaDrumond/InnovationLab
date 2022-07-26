package pt.uc.dei.projfinal.rest;

import java.util.Collection;

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

import pt.uc.dei.projfinal.dto.DTOInterest;
import pt.uc.dei.projfinal.dto.DTOSkill;
import pt.uc.dei.projfinal.entity.Forum;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.User.UserType;
import pt.uc.dei.projfinal.service.ForumService;
import pt.uc.dei.projfinal.service.InterestService;
import pt.uc.dei.projfinal.service.UserService;
import pt.uc.dei.projfinal.utilities.ActionLog;
import pt.uc.dei.projfinal.utilities.LogGenerator;

@Path("/interests")
public class InterestController {

	@Inject
	InterestService interestService;
	@Inject
	UserService userService;
	@Inject
	ForumService forumService;
	ActionLog actionLog;
	@Context
	private HttpServletRequest request;

	// 
	@Path("/new")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response createInterest(DTOInterest interestDto) {

		if (interestDto == null) {
			return Response.status(406).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			int idNewInterest = interestService.createInterest(interestDto);
			LogGenerator.generateAndWriteLog(request, actionLog.CREATE_INTEREST);
			return Response.ok(idNewInterest).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}

	}

	// endpoint para associar interesse(s) a user
	@Path("/associate/with/{user}")
	@POST
	public Response associateInterestWithUser(String idsJson, @PathParam("user") String user) {

		if (idsJson == null || idsJson.isEmpty() || user == null || user.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToEdit = userService.findUser(user);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToEdit == null
					|| userToEdit.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (interestService.checkAuthEditUser(loggedUser, userToEdit)) {
				interestService.associateInterestToUser(loggedUser, idsJson);
				LogGenerator.generateAndWriteLog(request, actionLog.ASSOCIATE_INTEREST_WITH_USER);
				return Response.ok().build();
			}
			return Response.status(406).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para desassociar interesse de user
	@Path("/desassociate/with/{user}")
	@POST
	public Response desassociateInterestWithUser(String idsJson, @PathParam("user") String user) {

		if (idsJson == null || idsJson.isEmpty() || user == null || user.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToEdit = userService.findUser(user);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToEdit == null
					|| userToEdit.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (interestService.checkAuthEditUser(loggedUser, userToEdit)) {
				interestService.desassociateInterestFromUser(loggedUser, idsJson);
				LogGenerator.generateAndWriteLog(request, actionLog.DISASSOCIATE_INTEREST_WITH_USER);
				return Response.ok().build();
			}
			return Response.status(466).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para associar um ou vários interesses a ideia/necessidade
	@Path("/associate/with/forum/{forumId}")
	@POST
	public Response associateInterestWithForum(@PathParam("forumId") String forumId, String idsJson) {

		if (idsJson == null || idsJson.isEmpty() || forumId == null || forumId.isEmpty()) {
			return Response.status(406).build();
		}

		// Postman {"idsInterest":[3,2,8]}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			Forum forum = forumService.findForum(Integer.parseInt(forumId));

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (!interestService.checkAuthorization(loggedUser, forum)) {
				return Response.status(486).build();
			}

			interestService.associateInterestToForum(Integer.parseInt(forumId), idsJson);
			LogGenerator.generateAndWriteLog(request, actionLog.ASSOCIATE_INTEREST_WITH_FORUM);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para desassociar interesse de ideia/necessidade
	@Path("desassociate/forum/{forumId}")
	@POST
	public Response desassociateInterestWithProject(@PathParam("forumId") String forumId, String idsJson) {

		if (idsJson == null || idsJson.isEmpty() || forumId == null || forumId.isEmpty()) {
			return Response.status(401).build();
		}

		// Postman {"idsInterest":[3,2,8]}
		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			Forum forum = forumService.findForum(Integer.parseInt(forumId));

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}
			if (!interestService.checkAuthorization(loggedUser, forum)) {
				return Response.status(486).build();
			}

			interestService.desassociateInterestFromForum(Integer.parseInt(forumId), idsJson);
			LogGenerator.generateAndWriteLog(request, actionLog.DISASSOCIATE_INTEREST_WITH_FORUM);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// user é o user logado
	// searchKey é a palavra que o user vai digitar
	// visitantes podem consultar interesses
	@Path("/search/{searchKey}")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getInterestsBySearchKey(@PathParam("searchKey") String searchKey) {

		if (searchKey == null || searchKey.isEmpty()) {
			return Response.status(406).build();
		}
		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOInterest> skillsDto = interestService.searchInterestsBySearchKey(searchKey);
			LogGenerator.generateAndWriteLog(request, actionLog.ACTIVE_INTEREST_SEARCH);
			return Response.ok(skillsDto).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// Buscar todos os interesses
	// Será usado para carregar a comboBox do filtrar forum, por exemplo
	@Path("/all")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAllInterests() {

		// 
		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null) {
				return Response.status(403).build();
			}

			Collection<DTOInterest> allDto = interestService.getAllInterests();
			LogGenerator.generateAndWriteLog(request, actionLog.SEARCH_ALL_INTERESTS);
			return Response.ok(allDto).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// Buscar interesses associadas a um user
	// Para o item 6.4
	// No path estará o user logado
	// No header estará o user de quem estou vendo a area pessoal
	@Path("/associated/user/{user}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response GetInterestsAssociatedWithUser(@PathParam("user") String email) {

		if (email == null || email.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToCheck = userService.findUser(email);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToCheck == null
					|| userToCheck.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOInterest> dtos = interestService.GetInterestsAssociatedWithUser(email);
			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_INTERESTS_ASSOCIATED_USER);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para obter lista de skills assciadas ao forum
	@Path("/associated/forum/{id}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response GetInterestAssociatedWithForum(@PathParam("id") String forumId) {

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

			if (forum.isSoftDelete()) {
				return Response.status(496).build();
			}

			Collection<DTOInterest> dtos = interestService.GetInterestsAssociatedWithForum(Integer.parseInt(forumId));
			//
			LogGenerator.generateAndWriteLog(request, actionLog.GET_FORUM_INTERESTS);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}
}
