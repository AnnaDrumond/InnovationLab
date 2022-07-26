package pt.uc.dei.projfinal.rest;

import java.util.Collection;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import pt.uc.dei.projfinal.dto.DTOSkill;
import pt.uc.dei.projfinal.entity.Forum;
import pt.uc.dei.projfinal.entity.Project;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.User.UserType;
import pt.uc.dei.projfinal.service.ForumService;
import pt.uc.dei.projfinal.service.ProjectService;
import pt.uc.dei.projfinal.service.SkillService;
import pt.uc.dei.projfinal.service.UserService;
import pt.uc.dei.projfinal.utilities.ActionLog;
import pt.uc.dei.projfinal.utilities.LogGenerator;

@Path("/skills")
public class SkillController {

	@Inject
	UserService userService;
	@Inject
	SkillService skillService;
	@Inject
	ForumService forumService;
	@Inject
	ProjectService projectService;
	@Context
	private HttpServletRequest request;
	ActionLog actionLog;

	// endpoint para criar uma nova skill
	@Path("/new")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response createSkill(DTOSkill dtoSkill) {

		if (dtoSkill == null) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			int idNewSkill = skillService.createSkill(dtoSkill);
			LogGenerator.generateAndWriteLog(request, actionLog.CREATE_SKILL);
			return Response.ok(idNewSkill).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para associar o user logado a uma/várias skill
	@Path("/associate/with/{user}")
	@POST
	public Response associateSkillWithUser(String idsJson, @PathParam("user") String user) {

		// Postman {"idsSkills":[3,2,8]}
		
		if (idsJson == null || idsJson.isEmpty()|| user == null || user.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToEdit = userService.findUser(user);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToEdit == null || userToEdit.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}
			
			if(skillService.checkAuthEditUser(loggedUser, userToEdit)) {
				skillService.associateSkillToUser(userToEdit, idsJson);
				LogGenerator.generateAndWriteLog(request, actionLog.ASSOCIATE_SKILL_WITH_USER);
				return Response.ok().build();
			}
			return Response.status(466).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para desassociar o user logado a uma/várias skill
	@Path("/desassociate/with/{user}")
	@POST
	public Response desassociateSkillWithUser(String idsJson, @PathParam("user") String user) {

		// Postman {"idsSkills":[3,2,8]}
		
		if (idsJson == null || idsJson.isEmpty()|| user == null || user.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToEdit = userService.findUser(user);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToEdit == null || userToEdit.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}
			
			if(skillService.checkAuthEditUser(loggedUser, userToEdit)) {
				skillService.desassociateSkillFromUser(userToEdit, idsJson);
				LogGenerator.generateAndWriteLog(request, actionLog.DISASSOCIATE_SKILL_FROM_USER);
				return Response.ok().build();
			}
			return Response.status(466).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para associar um projeto a uma skill OU a várias skills
	// o método do back recebe um array de ids de skill
	// separa estes ids e chama o fetch várias vezes para cada id
	@Path("associate/with/project/{projectId}")
	@POST
	public Response associateSkillWithProject(@PathParam("projectId") String projectId, String idsJson) {

		// Postman {"idsSkills":[3,2,8]}

		if (projectId == null || projectId.isEmpty() || idsJson == null || idsJson.isEmpty()) {
			return Response.status(406).build();
		}
		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (!skillService.checkAuthorization(loggedUser, Integer.parseInt(projectId))) {
				return Response.status(487).build();
			}

			skillService.associateSingleOrMultipleSkillsToProject(Integer.parseInt(projectId), idsJson);
			LogGenerator.generateAndWriteLog(request, actionLog.ASSOCIATE_SKILL_WITH_PROJECT);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para desassociar um projeto de uma skill
	@Path("/desassociate/project/{projectId}")
	@POST
	public Response desassociateSkillWithProject(@PathParam("projectId") String projectId, String idsJson) {

		if (projectId == null || projectId.isEmpty() || idsJson == null) {
			return Response.status(406).build();
		}
		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (!skillService.checkAuthorization(loggedUser, Integer.parseInt(projectId))) {
				return Response.status(487).build();
			}

			if (skillService.desassociateSkillFromProject(Integer.parseInt(projectId), idsJson)) {
				LogGenerator.generateAndWriteLog(request, actionLog.DISASSOCIATE_SKILL_FROM_PROJECT);
				return Response.ok().build();
			}
			return Response.status(488).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para associar um forum a uma/várias skill
	@Path("/associate/with/forum/{forumId}")
	@POST
	public Response associateSkillWithForum(@PathParam("forumId") String forumId, String idsJson) {

		if (forumId == null || forumId.isEmpty() || idsJson == null || idsJson.isEmpty()) {
			return Response.status(406).build();
		}

		// Postman {"idsSkills":[3,2,8]}
		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (!skillService.checkAuthorizationForum(loggedUser, Integer.parseInt(forumId))) {
				return Response.status(487).build();
			}

			skillService.associateSkillsToForum(Integer.parseInt(forumId), idsJson);
			LogGenerator.generateAndWriteLog(request, actionLog.ASSOCIATE_SKILL_WITH_FORUM);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para desassociar um forum de uma skill
	@Path("/desassociate/forum/{forumId}")
	@POST
	public Response desassociateSkillWithForum(@PathParam("forumId") String forumId, String idsJson) {

		// Postman {"idsSkills":[3,2,8]}

		if (forumId == null || forumId.isEmpty() || idsJson == null || idsJson.isEmpty()) {
			return Response.status(406).build();
		}
		try {
			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (!skillService.checkAuthorizationForum(loggedUser, Integer.parseInt(forumId))) {
				return Response.status(487).build();
			}

			skillService.desassociateSkillsFromForum(Integer.parseInt(forumId), idsJson);
			LogGenerator.generateAndWriteLog(request, actionLog.DISASSOCIATE_SKILL_FROM_FORUM);
			return Response.ok().build();

		} catch (

		Exception e) {
			return Response.status(401).build();
		}
	}

	
	// searchKey é a palavra que o user vai digitar
	// visitantes podem consultar skilss
	@Path("/search/{searchKey}")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getSkillsBySearchKey(@PathParam("searchKey") String searchKey) {

		if (searchKey == null || searchKey.isEmpty()) {
			return Response.status(406).build();
		}
		try {
			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOSkill> skillsDto = skillService.searchSkillsBySearchKey(searchKey);
			LogGenerator.generateAndWriteLog(request, actionLog.ACTIVE_SKILL_SEARCH);
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
	public Response getAllSkills() {

		// Qualquer user pode
		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null) {
				return Response.status(403).build();
			}

			Collection<DTOSkill> allDto = skillService.getAllSkills();
			LogGenerator.generateAndWriteLog(request, actionLog.SEARCH_ALL_SKILLS);
			return Response.ok(allDto).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// Buscar skills associadas a um user
	// Para o item 6.4
	// No path estará o user logado
	// No header estará o user de quem estou vendo a area pessoal
	@Path("/associated/user/{user}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response GetSkillsAssociatedWithUser(@PathParam("user") String email) {

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

			Collection<DTOSkill> dtos = skillService.GetSkillsAssociatedWithUser(email);
			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_SKILLS_ASSOCIATED_USER);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para obter lista de skills assciadas ao projeto
	@Path("/associated/project/{id}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response GetSkillsAssociatedWithProject(@PathParam("id") String projectId) {

		if (projectId == null || projectId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Project project = projectService.findProject(Integer.parseInt(projectId));

			if (project.isSoftDelete()) {
				return Response.status(493).build();
			}

			Collection<DTOSkill> dtos = skillService.GetSkillsAssociatedWithProject(Integer.parseInt(projectId));
			LogGenerator.generateAndWriteLog(request, actionLog.GET_RPOJECT_SKILLS);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para obter lista de skills assciadas ao forum
	@Path("/associated/forum/{id}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response GetSkillsAssociatedWithForum(@PathParam("id") String forumId) {

		System.out.println("GetSkillsAssociatedWithUser - controller");

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

			Collection<DTOSkill> dtos = skillService.GetSkillsAssociatedWithForum(Integer.parseInt(forumId));
			LogGenerator.generateAndWriteLog(request, actionLog.GET_FORUM_SKILLS);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// get skill por id
	@Path("/with/{id}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getById(@PathParam("id") String id) {

		if (id == null || id.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null) {
				return Response.status(403).build();
			}

			DTOSkill dto = skillService.getById(Integer.parseInt(id));
			LogGenerator.generateAndWriteLog(request, actionLog.GET_SKILL_BY_ID);
			return Response.ok(dto).build();

		} catch (Exception e) {

			return Response.status(401).build();
		}
	}

}
