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

import org.json.JSONObject;

import pt.uc.dei.projfinal.dto.DTOForum;
import pt.uc.dei.projfinal.dto.DTOProject;
import pt.uc.dei.projfinal.dto.DTOSkill;
import pt.uc.dei.projfinal.dto.DTOUser;
import pt.uc.dei.projfinal.entity.Member.MemberStatus;
import pt.uc.dei.projfinal.entity.Notification.NotificationType;
import pt.uc.dei.projfinal.entity.Project;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.User.UserType;
import pt.uc.dei.projfinal.service.ForumService;
import pt.uc.dei.projfinal.service.NotificationService;
import pt.uc.dei.projfinal.service.ProjectService;
import pt.uc.dei.projfinal.service.UserService;
import pt.uc.dei.projfinal.utilities.ActionLog;
import pt.uc.dei.projfinal.utilities.LogGenerator;

@Path("/projects")
public class ProjectController {

	@Inject
	ProjectService projectService;
	@Inject
	UserService userService;
	@Inject
	NotificationService notificationService;
	@Inject
	ForumService forumService;
	ActionLog actionLog;
	@Context
	private HttpServletRequest request;

	// criar projeto
	@Path("/new")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response createProject(DTOProject projectDto) {

		if (projectDto == null) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (projectService.verifyInvolvementInActiveProject(emailSession)) {
				// user tem projeto ativo ou é membro de um projeto ativo
				return Response.status(499).build();
			}

			int idnewProject = projectService.createProject(projectDto, loggedUser);
			LogGenerator.generateAndWriteLog(request, actionLog.CREATE_PROJECT);

			return Response.ok(idnewProject).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}

	}

	// endpoint para adicionar projeto aos favoritos do utilizador
	@Path("/likes/{id}")
	@POST
	public Response likeProject(@PathParam("id") String projectId) {

		if (projectId == null || projectId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (projectService.addProjectToUserFavorites(loggedUser, Integer.parseInt(projectId))) {
				LogGenerator.generateAndWriteLog(request, actionLog.FAVORITED_PROJECT);
				return Response.ok().build();
			}
			// projeto soft delete
			return Response.status(493).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para remover projeto dos favoritos do utilizador
	@Path("/removeLikes/{id}")
	@POST
	public Response removeLikeProject(@PathParam("id") String projectId) {

		if (projectId == null || projectId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			projectService.removeProjectFromUserFavorites(loggedUser, Integer.parseInt(projectId));
			LogGenerator.generateAndWriteLog(request, actionLog.REMOVE_FAVORITE_PROJECT);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para votar no projeto
	@Path("/voted/{id}")
	@POST
	public Response voteProject(@PathParam("id") String projectId) {

		if (projectId == null || projectId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (projectService.voteInProject(loggedUser, Integer.parseInt(projectId))) {
				LogGenerator.generateAndWriteLog(request, actionLog.VOTED_PROJECT);
				return Response.ok().build();
			}

			// projeto soft delete
			return Response.status(493).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para remover o voto do projeto
	@Path("/RemoveVote/{id}")
	@POST
	public Response removeVoteProject(@PathParam("id") String projectId) {

		if (projectId == null || projectId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			projectService.removeVoteInProject(loggedUser, Integer.parseInt(projectId));
			LogGenerator.generateAndWriteLog(request, actionLog.REMOVE_VOTE_PROJECT);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para editar projeto
	@Path("/edit/{id}")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response editProject(@PathParam("id") String projectId, DTOProject dto) {

		if (projectId == null | projectId.isEmpty() || dto == null) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (projectService.verifyMemberShipActive(Integer.parseInt(projectId), emailSession)
					|| loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {

				Project project = projectService.findProject(Integer.parseInt(projectId));

				if (!project.isActive()) {
					return Response.status(494).build();
				}

				if (project.isSoftDelete()) {
					return Response.status(493).build();
				}

				if (projectService.editProject(dto, project)) {
					LogGenerator.generateAndWriteLog(request, actionLog.EDIT_PROJECT);
					return Response.ok().build();
				}
			}

			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para associar projeto a forum
	@Path("associate/with/project/{idProject}")
	@POST
	public Response associateProjectAndForum(@PathParam("idProject") String projectId, String idsJson) {

		// Postman {"idsForum":[3,2,8]}

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

			if (projectService.verifyMemberShipActive(Integer.parseInt(projectId), emailSession)
					|| loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {

				Project project = projectService.findProject(Integer.parseInt(projectId));

				if (project.isSoftDelete()) {
					return Response.status(493).build();
				}

				if (!project.isActive()) {
					return Response.status(494).build();
				}

				projectService.associateProjectAndSingleOrMultipleForums(project, idsJson);
				LogGenerator.generateAndWriteLog(request, actionLog.ASSOCIATE_PROJECT_AND_FORUM);
				return Response.ok().build();

			}

			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para desassociar projeto de forum
	@Path("/desassociate/from/{idProject}")
	@POST
	public Response desassociateProjectAndForum(@PathParam("idProject") String projectId, String idsJson) {

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

			if (projectService.verifyMemberShipActive(Integer.parseInt(projectId), emailSession)
					|| loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {

				Project project = projectService.findProject(Integer.parseInt(projectId));

				if (!project.isActive()) {
					return Response.status(494).build();
				}

				if (project.isSoftDelete()) {
					return Response.status(493).build();
				}

				if (projectService.desassociateProjectAndForum(Integer.parseInt(projectId), idsJson)) {

					LogGenerator.generateAndWriteLog(request, actionLog.DESASSOCIATE_PROJECT_AND_FORUM);
					return Response.ok().build();
				}
				// o a entidade está deleted
				return Response.status(496).build();

			}
			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// Listar Forums associados a um determinado projeto
	@Path("/list/forums/{id}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response listForumsAssociatedWithProject(@PathParam("id") String projectId) {
		if (projectId == null || projectId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOForum> list = projectService.listForumsAssociatedWithProject(Integer.parseInt(projectId));
			LogGenerator.generateAndWriteLog(request, actionLog.LIST_FORUMS_ASSOCIATED_WITH_PROJECT);
			return Response.ok(list).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para listar os projetos favoritos do user
	@Path("/favorites")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response listFavoriteProject() {

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOProject> list = projectService.listFavoriteProject(emailSession);
			LogGenerator.generateAndWriteLog(request, actionLog.LIST_FAVORITES_PROJECT);
			return Response.ok(list).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para filtrar os projetos em que o user está envolvido
	// filtrar projetos em que um user está envolvido por skills
	@Path("/filter/envolved")
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public Response filterEnvolvedProjectsBySkills(@HeaderParam("email") String emailUser, String idsJson) {
		if (emailUser == null || emailUser.isEmpty() || idsJson == null) {
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

			Collection<DTOProject> list = projectService.listFilteredEnvolvedProjects(userToView, idsJson);
			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_PROJECT_USER_IS_ENVOLVED_BY_SKILL);
			return Response.ok(list).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para adicionar/convidar membros para o projeto
	// header é o user a ser add
	@Path("/add/member/{id}")
	@POST
	public Response addProjectMember(@PathParam("id") String projectId, @HeaderParam("email") String emailUser) {
		
		System.out.println("id");

		if (projectId == null || projectId.isEmpty() || emailUser == null || emailUser.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToAdd = userService.findUser(emailUser);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToAdd == null
					|| userToAdd.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (projectService.verifyMemberShipActive(Integer.parseInt(projectId), emailSession)
					|| loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {

				Project project = projectService.findProject(Integer.parseInt(projectId));

				if (!project.isActive()) {
					return Response.status(494).build();
				}

				if (project.isSoftDelete()) {
					return Response.status(493).build();
				}

				MemberStatus statusMember = projectService.verifyStatusUserInvolvedWithProject(emailUser, project);
				// user já se encontra na lista de membros daquele projeto (como admin,
				// participante, soliciante ou convidado)

				if (statusMember.equals(MemberStatus.INVITED)) {
					return Response.status(476).build();
				}

				if (statusMember.equals(MemberStatus.SOLICITOR)) {
					return Response.status(477).build();
				}

				System.out.println("verifiquei se é solicitor ou invited e vou add");
				if (projectService.addMembersToProject(userToAdd, project)) {

					LogGenerator.generateAndWriteLog(request, actionLog.ADD_MEMBER_TO_PROJECT);

					notificationService.newNotification("Foi convidado para integrar o projeto " + project.getTitle(),
							NotificationType.INVITE, userToAdd, Integer.parseInt(projectId), emailUser);

					LogGenerator.generateAndWriteLog(request, actionLog.CREATE_INVITE_NOTIFICATION);
					return Response.ok().build();
				}

				// projeto inativo
				return Response.status(494).build();
			}
			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para remover membros do projeto
	@Path("/remove/member/{id}")
	@POST
	public Response removeProjectMember(@PathParam("id") String projectId, @HeaderParam("email") String emailUser) {

		if (projectId == null || projectId.isEmpty() || emailUser == null || emailUser.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToRemove = userService.findUser(emailUser);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToRemove == null
					|| userToRemove.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			System.out.println(projectService.verifyMemberShipActive(Integer.parseInt(projectId), emailSession));

			System.out.println(loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR));
			if (projectService.verifyMemberShipActive(Integer.parseInt(projectId), emailSession)
					|| loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {

				Project project = projectService.findProject(Integer.parseInt(projectId));

				if (!project.isActive()) {
					return Response.status(494).build();
				}

				if (project.isSoftDelete()) {
					return Response.status(493).build();
				}

				if (!projectService.verifyIfUserInvolvedWithProject(emailUser, project)) {
					// user não se encontra envolvido naquele projeto
					return Response.status(490).build();
				}

				boolean wasAdmin = projectService.removeMembersToProject(userToRemove, loggedUser,
						Integer.parseInt(projectId));
				LogGenerator.generateAndWriteLog(request, actionLog.REMOVE_MEMBER_FROM_PROJECT);

				if (wasAdmin) {
					notificationService.deleteNotificationsOfProjectParticipant(emailUser, Integer.parseInt(projectId));
					return Response.ok().build();
				}

				return Response.status(484).build();

			}
			return Response.status(455).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para obter a lista de users que estão disponíveis para integrar a
	// lista de projetos
	@Path("/get/available/users/{searchKey}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAvailableUsers(@PathParam("searchKey") String searchKey) {

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

			List<DTOUser> dtoList = projectService.getListAvailableUsers(searchKey);
			LogGenerator.generateAndWriteLog(request, actionLog.GET_LIST_AVAILABLE_USERS);
			return Response.ok(dtoList).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// método para tornar o projeto concluído
	@Path("/finished/{id}")
	@POST
	public Response finishProject(@PathParam("id") String projectId) {

		if (projectId == null || projectId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (projectService.verifyMemberShipActive(Integer.parseInt(projectId), emailSession)
					|| loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {

				Project project = projectService.findProject(Integer.parseInt(projectId));

				if (!project.isActive()) {
					return Response.status(494).build();
				}

				if (project.isSoftDelete()) {
					return Response.status(493).build();
				}

				projectService.finishProject(Integer.parseInt(projectId));
				LogGenerator.generateAndWriteLog(request, actionLog.FINISH_PROJECT);
				return Response.ok().build();

			}

			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para listar skills do projeto
	@Path("/skills/{projectId}/project")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response listProjectSkills(@PathParam("projectId") String projectId) {

		if (projectId == null || projectId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOSkill> dtoList = projectService.listAssociatedSkills(Integer.parseInt(projectId));
			LogGenerator.generateAndWriteLog(request, actionLog.LIST_PROJECT_SKILLS);
			return Response.ok(dtoList).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para promover membro participate do projeto a administrador do
	// projeto
	@Path("/promote/in/{projectId}/project")
	@POST
	public Response promoteParticipantToProjectAdmin(@PathParam("projectId") String projectId,
			@HeaderParam("email") String emailUser) {

		if (projectId == null || projectId.isEmpty() || emailUser == null || emailUser.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToPromote = userService.findUser(emailUser);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToPromote == null
					|| userToPromote.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (projectService.verifyMemberShipActive(Integer.parseInt(projectId), emailSession)
					|| loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {

				Project project = projectService.findProject(Integer.parseInt(projectId));

				if (!project.isActive()) {
					return Response.status(494).build();
				}

				if (project.isSoftDelete()) {
					return Response.status(493).build();
				}

				if (!projectService.verifyIfUserInvolvedWithProject(emailUser, project)) {
					// user não se encontra envolvido naquele projeto
					return Response.status(490).build();
				}

				projectService.promoteUserToProjectAdmin(userToPromote, Integer.parseInt(projectId));
				LogGenerator.generateAndWriteLog(request, actionLog.PROMOTE_PARTICIPANT_TO_PROJECT_ADMIN);
				return Response.ok().build();

			}
			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para promover utilizador de convidado/solicitador a participante
	// header é quem vou promover
	@Path("/promote/participant/{projectId}/project")
	@POST
	public Response promoteToProjectParticipant(@PathParam("projectId") String projectId,
			@HeaderParam("email") String emailUser) {

		if (projectId == null || projectId.isEmpty() || emailUser == null || emailUser.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToPromote = userService.findUser(emailUser);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToPromote == null
					|| userToPromote.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (projectService.verifyMemberShipActive(Integer.parseInt(projectId), emailSession)
					|| loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {

				Project project = projectService.findProject(Integer.parseInt(projectId));

				if (project.isSoftDelete()) {
					// projeto soft delete
					return Response.status(493).build();
				}

				if (!project.isActive()) {
					// projeto inativo
					return Response.status(494).build();
				}

				if (!projectService.verifyIfUserInvolvedWithProject(emailUser, project)) {
					// user não se encontra envolvido naquele projeto
					return Response.status(490).build();
				}

				if (projectService.promoteUserToProjectParticipant(userToPromote, Integer.parseInt(projectId))) {
					LogGenerator.generateAndWriteLog(request, actionLog.PROMOTE_TO_PROJECT_PARTICIPANT);

					notificationService.deleteNotificationsOfOtherProjectAdmins(Integer.parseInt(projectId), emailUser);
					LogGenerator.generateAndWriteLog(request, actionLog.REMOVE_NOTIFICATIONS_FROM_PROJECT_ADMINS);

					notificationService.newNotification(
							"O seu pedido para ser membro do projeto " + project.getTitle() + " foi aceite.",
							NotificationType.ACCEPTED, userToPromote, Integer.parseInt(projectId), emailUser);

					LogGenerator.generateAndWriteLog(request, actionLog.CREATE_ACCEPTED_NOTIFICATION);
					return Response.ok().build();
				}
				// user não é membro solicitador do projeto
				return Response.status(489).build();
			}

			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para despromover administrador do projeto a participante
	@Path("/dispromote/participant/{projectId}/project")
	@POST
	public Response dispromoteToProjectParticipant(@PathParam("projectId") String projectId,
			@HeaderParam("email") String emailUser) {
		if (projectId == null || projectId.isEmpty() || emailUser == null || emailUser.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToDispromote = userService.findUser(emailUser);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToDispromote == null
					|| userToDispromote.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (projectService.verifyMemberShipActive(Integer.parseInt(projectId), emailSession)
					|| loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {

				Project project = projectService.findProject(Integer.parseInt(projectId));

				if (!project.isActive()) {
					return Response.status(494).build();
				}

				if (project.isSoftDelete()) {
					return Response.status(493).build();
				}

				if (!projectService.verifyIfUserInvolvedWithProject(emailUser, project)) {
					// user não se encontra envolvido naquele projeto
					return Response.status(490).build();
				}

				if (projectService.dispromoteUserToProjectParticipant(userToDispromote, Integer.parseInt(projectId))) {
					notificationService.deleteNotificationsOfProjectDispomoted(emailUser, Integer.parseInt(projectId));
					LogGenerator.generateAndWriteLog(request, actionLog.DISPROMOTE_TO_PROJECT_PARTICIPANT);
					return Response.ok().build();
				}
				return Response.status(484).build();

			}
			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para o utilizador pedir para participar no projeto
	@Path("/solicit/participation/{projectId}/project")
	@POST
	public Response solicitParticipationInProject(@PathParam("projectId") String projectId) {
		if (projectId == null || projectId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Project project = projectService.findProject(Integer.parseInt(projectId));

			if (!project.isActive()) {
				return Response.status(494).build();
			}

			if (project.isSoftDelete()) {
				return Response.status(493).build();
			}

			if (projectService.verifyIfUserInvolvedWithProject(emailSession, project)) {
				// user já se encontra na lista de membros daquele projeto (como admin,
				// participante, soliciante ou convidado)
				return Response.status(492).build();
			}

			projectService.solicitParticipationInProject(loggedUser, project);

			LogGenerator.generateAndWriteLog(request, actionLog.SOLICIT_PARTICIPATION_IN_PROJECT);

			String notificationContent = "o utilizador " + loggedUser.getFirstName() + " " + loggedUser.getLastName()
					+ " deseja participar no projeto " + project.getTitle();

			notificationService.sendNotificationToMembers(notificationContent, NotificationType.REQUEST,
					project.getId(), emailSession);

			LogGenerator.generateAndWriteLog(request, actionLog.CREATE_REQUEST_NOTIFICATION);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para o utilizador convidado a integrar um projeto aceitar o convite
	@Path("/accept/invitation/{projectId}/project")
	@POST
	public Response acceptInvitation(@PathParam("projectId") String projectId) {
		System.out.println();
		if (projectId == null || projectId.isEmpty()) {
			return Response.status(406).build();
		}
		try {
			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Project project = projectService.findProject(Integer.parseInt(projectId));

			if (!project.isActive()) {
				return Response.status(494).build();
			}

			if (project.isSoftDelete()) {
				return Response.status(493).build();
			}

			if (!projectService.verifyIfUserInvolvedWithProject(emailSession, project)) {
				// user já se encontra na lista de membros daquele projeto (como admin,
				// participante, soliciante ou convidado)
				return Response.status(492).build();
			}

			if(projectService.acceptInvitation(emailSession, project)) {
				LogGenerator.generateAndWriteLog(request, actionLog.ACCEPT_INVITATION_IN_PROJECT);
				return Response.ok().build();
			}
			return Response.status(457).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para o admin do projeto eliminar convites que fez para utilizadores
	// serem participantes do projeto
	@Path("/{email}/refuse/invitation/{projectId}/project")
	@POST
	public Response deleteInvite(@PathParam("email") String email, @PathParam("projectId") String projectId) {
		if (projectId == null || projectId.isEmpty() || email == null || email.isEmpty()) {
			return Response.status(406).build();
		}

		try {
			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToRemove = userService.findUser(email);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToRemove == null
					|| userToRemove.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (projectService.verifyMemberShipActive(Integer.parseInt(projectId), emailSession)
					|| loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {
				Project project = projectService.findProject(Integer.parseInt(projectId));

				if (!project.isActive()) {
					return Response.status(494).build();
				}

				if (project.isSoftDelete()) {
					return Response.status(493).build();
				}

				if (!projectService.verifyIfUserInvolvedWithProject(email, project)) {
					// user não se encontra envolvido naquele projeto
					return Response.status(490).build();
				}

				projectService.refuseParticipationInProject(userToRemove, Integer.parseInt(projectId));
				LogGenerator.generateAndWriteLog(request, actionLog.REFUSE_INVITATION_IN_PROJECT);
				notificationService.deleteNotificationsOfProjectParticipant(email, Integer.parseInt(projectId));
				return Response.ok().build();
			}
			//
			return Response.status(433).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para o utilizador recusar participação no projeto
	// válido para recusar convites
	@Path("/refuse/invitation/{projectId}/project")
	@POST
	public Response refuseInvitationInProject(@PathParam("projectId") String projectId) {
		if (projectId == null || projectId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Project project = projectService.findProject(Integer.parseInt(projectId));

			if (!project.isActive()) {
				return Response.status(494).build();
			}

			if (project.isSoftDelete()) {
				return Response.status(493).build();
			}

			if (!projectService.verifyIfUserInvolvedWithProject(emailSession, project)) {
				// user não se encontra envolvido naquele projeto
				return Response.status(490).build();
			}

			projectService.refuseParticipationInProject(loggedUser, Integer.parseInt(projectId));
			LogGenerator.generateAndWriteLog(request, actionLog.REFUSE_INVITATION_IN_PROJECT);
			notificationService.deleteNotificationsOfProjectParticipant(emailSession, Integer.parseInt(projectId));
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para o utilizador recusar participação no projeto
	// válido para recusar solicitações
	@Path("/refuse/solicitation/{projectId}/project")
	@POST
	public Response refuseSolicitationInProject(@PathParam("projectId") String projectId,
			@HeaderParam("email") String emailUser) {

		if (projectId == null || projectId.isEmpty() || emailUser == null || emailUser.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userSolicitor = userService.findUser(emailUser);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userSolicitor == null
					|| userSolicitor.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (projectService.verifyMemberShipActive(Integer.parseInt(projectId), emailSession)
					|| loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {

				Project project = projectService.findProject(Integer.parseInt(projectId));

				if (!project.isActive()) {
					return Response.status(494).build();
				}

				if (project.isSoftDelete()) {
					return Response.status(493).build();
				}

				if (!projectService.verifyIfUserInvolvedWithProject(emailUser, project)) {
					// user não se encontra envolvido naquele projeto
					return Response.status(490).build();
				}

				projectService.refuseParticipationInProject(userSolicitor, Integer.parseInt(projectId));
				LogGenerator.generateAndWriteLog(request, actionLog.REFUSE_SOLICITATION_IN_PROJECT);

				notificationService.deleteNotificationsOfOtherProjectAdmins(project.getId(), emailUser);
				// notificationService.deleteNotificationsOfOtherProjectAdmins(Integer.parseInt(projectId),
				// emailUser);
				LogGenerator.generateAndWriteLog(request, actionLog.REMOVE_NOTIFICATIONS_FROM_PROJECT_ADMINS);

				return Response.ok().build();

			}
			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// listar todos os projetos
	@Path("/list/all")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response listAllProjects() {

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOProject> listDto = projectService.listAllProjects();
			LogGenerator.generateAndWriteLog(request, actionLog.LIST_ALL_PROJECTS);
			return Response.ok(listDto).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// filtrar os projetos através das skills associadas - lista geral de projetos -
	// feedProjetos
	@Path("/filter/skill/and/forum")
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public Response filterProjectsBySkills(String IdList) {
		if (IdList == null || IdList.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			List<DTOProject> listDto = projectService.filterProjectsBySkillAndOrForum(IdList);

			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_PROJECT_BY_SKILL_AND_OR_FORUM);

			return Response.ok(listDto).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// buscar projeto através do seu id
	@Path("/by/id/{id}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getProjectById(@PathParam("id") String idProject) {

		if (idProject == null || idProject.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			DTOProject dto = projectService.getProjectById(Integer.valueOf(idProject), loggedUser);
			LogGenerator.generateAndWriteLog(request, actionLog.GET_PROJECT_BY_ID);

			if (dto == null) {
				return Response.status(493).build();
			}
			//
			return Response.ok(dto).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para obter a lista de membros de um determinado projeto
	@Path("/members/{id}/project")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response listMembersInProject(@PathParam("id") String idProject) {

		if (idProject == null || idProject.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOUser> dtoList = projectService.getMembersFromProject(Integer.parseInt(idProject));

			LogGenerator.generateAndWriteLog(request, actionLog.GET_PROJECT_MEMBERS);

			return Response.ok(dtoList).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para obter a lista de admins ou participantes ou convidados ou
	// solicitadores daquele projeto
	@Path("/members/{id}/who/are/{type}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getMembers(@PathParam("id") String idProject, @PathParam("type") String type) {

		if (idProject == null || idProject.isEmpty() || type == null || type.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOUser> dtoList = projectService
					.getMembersFromProjectAccordingToType(Integer.parseInt(idProject), type);

			LogGenerator.generateAndWriteLog(request, actionLog.GET_PROJECT_MEMBERS_ACCORDING_TO_TYPE);

			return Response.ok(dtoList).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}

	}

	// get projetos que um user é membro admin ou participante - para a pagina
	// pessoal do
	// user - 6.4 - 3º paragrafo
	// No header estará o user de quem estou vendo a area pessoal
	@Path("/is/member")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response listProjectsUserIsMember(@HeaderParam("email") String emailUserPersonalArea) {

		if (emailUserPersonalArea == null || emailUserPersonalArea.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userToSee = userService.findUser(emailUserPersonalArea);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userToSee == null
					|| userToSee.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOProject> dtos = projectService.listProjectsUserIsMember(emailUserPersonalArea);

			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_PROJECT_USER_IS_ENVOLVED);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	@Path("/my/active")
	@GET
	@Produces(MediaType.TEXT_PLAIN)
	public Response activeProjectUserIsMember() {

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			JSONObject obj = projectService.activeProjectUserIsMember(emailSession);
			LogGenerator.generateAndWriteLog(request, actionLog.GET_MY_ACTIVE_PROJECT);
			return Response.ok(obj).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para verificar se o user está envolvido num projeto ativo
	@Path("/envolved/in/active")
	@POST
	@Produces(MediaType.TEXT_PLAIN)
	public Response seeIfuserEnvolvedInActiveProject() {

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			boolean envolved = projectService.verifyInvolvementInActiveProject(emailSession);
			LogGenerator.generateAndWriteLog(request, actionLog.SEE_IF_ENVOLVED_IN_ACTIVE_PROJECT);
			return Response.ok(envolved).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para verificar se o user tem autorização para editar o projeto
	@Path("/has/auth/{id}")
	@POST
	@Produces(MediaType.TEXT_PLAIN)
	public Response seeIfuserHasAuthorization(@PathParam("id") String projectId) {

		if (projectId == null || projectId.isEmpty()) {
			return Response.status(406).build();
		}
		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			boolean envolved = false;
			if (projectService.verifyMemberShipActive(Integer.parseInt(projectId), emailSession)
					|| loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {
				envolved = true;
			}

			LogGenerator.generateAndWriteLog(request, actionLog.SEE_IF_USER_HAS_AUTHORIZATION);
			return Response.ok(envolved).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// TODO funcionando
	// get filtrar por Skill projetos com a participação do utilizador
	// user - 6.4 - 3º paragrafo
	// No header estará o user de quem estou vendo a area pessoal
	@Path("/is/member/filter/by/skills")
	@POST
	@Produces(MediaType.APPLICATION_JSON)
	public Response listProjectsUserIsMemberFilterBySkill(@HeaderParam("email") String emailUserPersonalArea,
			String idsJson) {

		// Postman: { "idsSkills":[7,6]}

		System.out.println("entrei no controller");

		if (emailUserPersonalArea == null || emailUserPersonalArea.isEmpty() || idsJson == null || idsJson.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User userOwnerPage = userService.findUser(emailUserPersonalArea);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || userOwnerPage == null
					|| userOwnerPage.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOProject> dtos = projectService.listProjectsUserIsMemberFilterBySkill(emailUserPersonalArea,
					idsJson);

			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_PROJECT_USER_IS_ENVOLVED_BY_SKILL);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// get filtrar por Ideia/necessidade projetos com a participação do utilizador
	// user - 6.4 - 3º paragrafo
	// No header estará o user de quem estou vendo a area pessoal
	@Path("/is/member/filter/by/forum/{id}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response listProjectsUserIsMemberFilterByForum(@HeaderParam("email") String emailUserPersonalArea,
			@PathParam("id") String idForum) {

		System.out.println("entrei no controller");

		if (idForum == null || idForum.isEmpty() || emailUserPersonalArea == null || emailUserPersonalArea.isEmpty()) {
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

			Collection<DTOProject> dtos = projectService.listProjectsUserIsMemberFilter(emailUserPersonalArea,
					Integer.parseInt(idForum));

			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_PROJECT_USER_IS_ENVOLVED_BY_FORUM);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para fazer delete de um projeto
	@Path("delete/{id}")
	@POST
	public Response deleteProject(@PathParam("id") String projectId) {

		if (projectId == null || projectId.isEmpty()) {
			return Response.status(406).build();
		}
		try {
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}
			if (projectService.verifyMemberShipActive(Integer.parseInt(projectId), emailSession)
					|| loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {

				projectService.deleteProject(Integer.parseInt(projectId));
				LogGenerator.generateAndWriteLog(request, actionLog.DELETE_PROJECT);

				notificationService.deleteAllNotificationsOfThatProject(Integer.parseInt(projectId));
				LogGenerator.generateAndWriteLog(request, actionLog.DELETE_ALL_PROJECT_NOTIFICATIONS);

				return Response.ok().build();

			}
			return Response.status(403).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// endpoint para obter a lista de skills associadas àquele projeto
	@Path("/skills/associated/{projectId}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response listSkillsAssociatedWithForum(@PathParam("projectId") String projectId) {
		//
		if (projectId == null || projectId.isEmpty()) {
			return Response.status(406).build();
		}
		//
		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			List<DTOSkill> dtos = projectService.listAllSkillsOfProject(Integer.parseInt(projectId));

			LogGenerator.generateAndWriteLog(request, actionLog.GET_PROJECT_SKILL_LIST);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// busca ativa das skills de projetos que o user está envolvido
	@Path("/skills/in/projects/registered/{searchKey}")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response searchSkillsByProjectUser(@PathParam("searchKey") String searchKey,
			@HeaderParam("email") String emailUserPersonalArea) {

		//
		if (searchKey == null || searchKey.isEmpty() || emailUserPersonalArea == null
				|| emailUserPersonalArea.isEmpty()) {
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

			List<DTOSkill> dtos = projectService.searchSkillsByProjectUser(emailUserPersonalArea, searchKey);

			LogGenerator.generateAndWriteLog(request, actionLog.FILTER_PROJECT_USER_REGISTERED_BY_SKILL);
			return Response.ok(dtos).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

}
