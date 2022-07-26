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

import pt.uc.dei.projfinal.dto.DTOComment;
import pt.uc.dei.projfinal.dto.DTOReply;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.User.UserType;
import pt.uc.dei.projfinal.service.CommentService;
import pt.uc.dei.projfinal.service.UserService;
import pt.uc.dei.projfinal.utilities.ActionLog;
import pt.uc.dei.projfinal.utilities.LogGenerator;

@Path("/comments")
public class CommentController {

	@Inject
	CommentService commentService;
	@Inject
	UserService userService;
	@Context
	private HttpServletRequest request;
	ActionLog actionLog;

	// criar comentário
	// user do path é o user logado
	@Path("/new")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response createComment(DTOComment commentDto) {

		if (commentDto == null) {
			return Response.status(406).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			// vistantes não podem criar comentários
			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			commentService.createComment(commentDto, loggedUser);
			LogGenerator.generateAndWriteLog(request, actionLog.CREATE_COMMENT);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}

	}

	// criar resposta a um comentário
	// id do path - é o id do comentário original
	@Path("/reply/{id}")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response createReplyToComment(@PathParam("id") String id, DTOComment commentDto) {

		if (commentDto == null || id == null || id.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			// vistantes não podem criar comentários
			if (loggedUser == null || loggedUser.getTypeUser().equals(UserType.VISITOR)) {
				return Response.status(403).build();
			}

			commentService.createReply(loggedUser, Integer.parseInt(id), commentDto);
			LogGenerator.generateAndWriteLog(request, actionLog.REPLY_COMMENT);
			return Response.ok().build();

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	@GET
	@Path("/by/forum/{idForum}")
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAllCommentsByForumId(@PathParam("idForum") String idForum) {
		
		//System.out.println("getAllCommentsByForumId");

		if (idForum == null || idForum.isEmpty()) {
			return Response.status(406).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			User loggedUser = userService.findUser(emailSession);

			if (loggedUser == null) {
				return Response.status(403).build();
			}

			Collection<DTOComment> comments = commentService.getCommentsList(idForum);
			LogGenerator.generateAndWriteLog(request, actionLog.VIEW_COMMENTS);
			return Response.ok(comments).build();

		} catch (Exception e) {
			//System.out.println("catch controller");
			return Response.status(401).build();
		}
	}

	// Editar comentário
	// Pode ser editado por um admin ou pelo owner do comentário
	// Somente comentario que não estiver softDelete pode ser editado
	@Path("/edit/{id}")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response editComment(@PathParam("id") String idCommentToEdit, DTOComment commentDto) {

		if (commentDto == null || idCommentToEdit == null || idCommentToEdit.isEmpty()) {
			return Response.status(401).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));

			// Se o user logado for um admin ou for o user que escreveu o comentário(owner)
			// e se o comentário NÂO estiver softDelete
			if (commentService.checkAuthorizationToEdit(emailSession, idCommentToEdit)) {

				commentService.editComment(Integer.parseInt(idCommentToEdit), commentDto);
				LogGenerator.generateAndWriteLog(request, actionLog.EDIT_COMMENT);
				return Response.ok().build();

			} else { // Aqui já inclui a hipótese do user ser um visitante
				return Response.status(403).build();
			}

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}

	// SoftDelete - pode ser feito por um admin, pelo dono do Forum ou pelo dono do
	// comentario
	@Path("/delete/{id}")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	public Response softDeleteComment(@PathParam("id") String idCommentToEdit) {

		//System.out.println("softDeleteComment");

		if (idCommentToEdit == null || idCommentToEdit.isEmpty()) {
			return Response.status(401).build();
		}

		try {

			String emailSession = String.valueOf(request.getSession().getAttribute("user"));
			// Se o user logado for um admin ou for o user dono do Forum onde o comentário
			// foi postado
			if (commentService.checkAuthorizationToSoftDelete(emailSession, idCommentToEdit)) {

				commentService.softDeleteComment(Integer.parseInt(idCommentToEdit));
				LogGenerator.generateAndWriteLog(request, actionLog.SOFTDELETE_COMMENT);
				return Response.ok().build();

			} else { // Aqui já inclui a hipótese do user ser um visitante
				return Response.status(403).build();
			}

		} catch (Exception e) {
			return Response.status(401).build();
		}
	}
}
