package pt.uc.dei.projfinal.rest;

import java.util.Collection;

import javax.inject.Inject;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;
import javax.ws.rs.DELETE;
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

import pt.uc.dei.projfinal.dto.DTONotification;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.User.UserType;
import pt.uc.dei.projfinal.service.NotificationService;
import pt.uc.dei.projfinal.service.UserService;
import pt.uc.dei.projfinal.utilities.ActionLog;
import pt.uc.dei.projfinal.utilities.LogGenerator;

@Path("/notifications")
public class NotificationController {

	@Inject
	UserService userService;
	@Inject
	NotificationService notificationService;
	ActionLog actionLog;
	@Context
	private HttpServletRequest request;

	// endpoint para marcar a notificação como lida
	@Path("seen/{id}")
	@POST
	public Response markNotificationAsSeen(@PathParam("id") String notificationId) {

		if (notificationId == null || notificationId.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			notificationService.markAsSeen(Integer.parseInt(notificationId), loggedUser);
			LogGenerator.generateAndWriteLog(request, actionLog.MARK_NOTIFICATION_AS_SEEN);

			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// obter a lista de notificações daquele user
	@Path("/list")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response listNotifications() {

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTONotification> dtoList = notificationService.listNotifications(loggedUser);
			LogGenerator.generateAndWriteLog(request, actionLog.GET_NOTIFICATION_LIST);

			return Response.ok(dtoList).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	@Path("/delete/{id}")
	@DELETE
	public Response deleteNotification(@PathParam("id") String id) {
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

			boolean exist = notificationService.deleteNotificationById(Integer.parseInt(id));
			if (exist) {
				LogGenerator.generateAndWriteLog(request, actionLog.DELETE_NOTIFICATION);
				return Response.ok().build();
			}
			return Response.status(420).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	@Path("/get")
	@GET
	@Produces(MediaType.TEXT_PLAIN)
	public Response getNotificationsAndMessages() {
		try {
			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			JSONObject jsonToSend = notificationService.getMyNotificationsAndMessages(emailSession);
			//LogGenerator.generateAndWriteLog(request, actionLog.GET_NUMBER_NOTIFICATIONS_AND_MESSAGES);
			return Response.ok(jsonToSend).build();
			
		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

}
