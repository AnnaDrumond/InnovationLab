package pt.uc.dei.projfinal.rest;

import java.util.Collection;

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

import pt.uc.dei.projfinal.dto.DTOMessage;
import pt.uc.dei.projfinal.dto.DTOMessageComplete;
import pt.uc.dei.projfinal.entity.Forum;
import pt.uc.dei.projfinal.entity.Message;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.User.UserType;
import pt.uc.dei.projfinal.service.MessageService;
import pt.uc.dei.projfinal.service.UserService;
import pt.uc.dei.projfinal.utilities.ActionLog;
import pt.uc.dei.projfinal.utilities.LogGenerator;

@Path("/messages")
public class MessageController {

	@Context
	private HttpServletRequest request;

	@Inject
	UserService userService;

	@Inject
	MessageService messageService;
	ActionLog actionLog;

	/*
	 * 6.4.4.Enviar Mensagens Pessoais O sistema deve permitir ao Utilizador enviar
	 * mensagens pessoais a outro Utilizador. O destinatário deverá ser pesquisável
	 * por nome ou alcunha ( No front usar a pesquisa que já tem um user - pegar o
	 * email e enviar o email do destinatário no header
	 */
	// criar/enviar mensagem a outro user
	// o email do sender e do receiver vem no dto
	@Path("/new/for/{email}")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response createMessage(DTOMessage dtoMessage, @PathParam("email") String emailReceiver) {

		if (dtoMessage == null) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User receiver = userService.findUser(emailReceiver);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || receiver == null
					|| receiver.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			if (emailSession.equals(dtoMessage.getEmailReceiver())) {
				return Response.status(495).build();
			}

			messageService.sendMessage(dtoMessage, loggedUser, receiver);
			LogGenerator.generateAndWriteLog(request, actionLog.SEND_MESSAGE);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	/*
	 * 6.4.5.Consultar Mensagens Pessoais A página pessoal do Utilizador deve dar
	 * acesso a uma listagem de mensagens pessoais recebidas e enviadas. Esta
	 * listagem deve apresentar as mensagens agrupadas por destinatário/emissor e
	 * ordenadas por data/hora. As mensagens novas (não lidas) devem estar
	 * destacadas.
	 */

	// Admin não consulta msgs de outro user
	// email do header é o do outro user para consulta
	@Path("/all/between")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getBetweenUsersMessages(@HeaderParam("email") String emailToConsult) {

		if (emailToConsult == null || emailToConsult.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			User receiver = userService.findUser(emailToConsult);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR) || receiver == null
					|| receiver.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOMessageComplete> listDto = messageService.searchBetweenUsersMessages(emailSession,
					emailToConsult);
			LogGenerator.generateAndWriteLog(request, actionLog.SEE_MESSAGES);
			return Response.ok(listDto).build();

		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(401).build();
		}
	}

	@Path("/all/received")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getReceivedMessages() {

		try {
			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser.getTypeUser().equals(UserType.VISITOR) || loggedUser == null) {
				return Response.status(403).build();
			}

			Collection<DTOMessageComplete> listDto = messageService.searchReceivedMessages(emailSession);
			LogGenerator.generateAndWriteLog(request, actionLog.SEE_RECEIVED_MESSAGES);
			return Response.ok(listDto).build();

		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(401).build();
		}
	}

	@Path("/all/sent")
	@GET
	@Produces(MediaType.APPLICATION_JSON)
	public Response getSentMessages() {

		try {
			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			Collection<DTOMessageComplete> listDto = messageService.searchSentMessages(emailSession);
			LogGenerator.generateAndWriteLog(request, actionLog.SEE_SENT_MESSAGES);
			return Response.ok(listDto).build();

		} catch (Exception e) {
			System.out.println("catch do controller");
			e.printStackTrace();
			return Response.status(401).build();
		}
	}

	// marcar mensagem como lida/não lida
	// No path vem o userLogado
	@Path("/{id}/read")
	@POST
	public Response changeReadOrUnread(@PathParam("id") String id) {

		if (id == null || id.isEmpty()) {
			return Response.status(406).build();
		}

		try {
			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);
			Message message = messageService.getMessageById(Integer.parseInt(id));

			if (loggedUser.getTypeUser().equals(UserType.VISITOR) || loggedUser == null) {
				return Response.status(403).build();
			}

			// Muda status lida/nao lida se user logado for o recebedor da MSG ou um admin
			if (emailSession.equals(message.getReceiver().getEmail())) {

				if (messageService.changeMessageReadOrUnread(message)) {
					LogGenerator.generateAndWriteLog(request, actionLog.CHANGE_STATUS_MESSAGE);
					return Response.ok().build();
				}
			}

			return Response.status(403).build();

		} catch (Exception e) {
			e.printStackTrace();
			return Response.status(401).build();
		}
	}

	// endpoint para verificar se o user tem autorização para editar o forum
	@Path("/has/auth/{id}")
	@POST
	@Produces(MediaType.TEXT_PLAIN)
	public Response checkAuthorizationToView(@PathParam("id") String idMessage) {

		if (idMessage == null || idMessage.isEmpty()) {
			return Response.status(406).build();
		}
		try {

			// o email da session é o email do user logado naquele momento
			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null) {
				return Response.status(403).build();
			}

			boolean hasAuthorization = messageService.checkAuthorizationToView(loggedUser, idMessage);

			LogGenerator.generateAndWriteLog(request, actionLog.SEE_IF_USER_HAS_AUTHORIZATION);
			return Response.ok(hasAuthorization).build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}
}
