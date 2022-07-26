package pt.uc.dei.projfinal.service;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;

import pt.uc.dei.projfinal.dao.DAOComment;
import pt.uc.dei.projfinal.dao.DAOForum;
import pt.uc.dei.projfinal.dao.DAOUser;
import pt.uc.dei.projfinal.dto.DTOComment;
import pt.uc.dei.projfinal.dto.DTOReply;
import pt.uc.dei.projfinal.dto.DTOUser;
import pt.uc.dei.projfinal.entity.Comment;
import pt.uc.dei.projfinal.entity.Forum;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.User.UserType;

@RequestScoped
public class CommentService implements Serializable {

	private static final long serialVersionUID = 1L;

	@Inject
	DAOComment commentDao;
	@Inject
	DAOForum forumDao;
	@Inject
	DAOUser userDao;

	public CommentService() {

	}

	public void createComment(DTOComment dtoComment, User user) throws Exception {

		Comment comment = commentDao.convertDtoToEntity(dtoComment);
		Forum forum = forumDao.find(dtoComment.getForumId());
		comment.setReply(false);
		comment.setCommentOwner(user);
		comment.setForumWhereCommented(forum);
		commentDao.persist(comment);

		// atualizar a última atualização do forum quando o user comenta no forum
		Timestamp now = new Timestamp(System.currentTimeMillis());
		forum.setLastUpdate(now);
		forumDao.merge(forum);
	}

	// Cria a resposta a um comentário
	public void createReply(User user, int idComment, DTOComment dtoReplyComment) throws Exception {

		// Buscar comentário que receberá a resposta
		Comment originalComment = commentDao.find(idComment);

		// Converter a resposta para entidade
		Comment reply = commentDao.convertDtoToEntity(dtoReplyComment);

		// Buscar a ideia/necessidade owner do comentário/reply
		Forum forum = forumDao.find(originalComment.getForumWhereCommented().getId());

		// Fazer relações
		reply.setCommentOwner(user);
		reply.setForumWhereCommented(forum);
		reply.setReply(true);

		commentDao.persist(reply);

		// atualizar a última atualização do forum quando o user comenta no forum
		Timestamp now = new Timestamp(System.currentTimeMillis());
		forum.setLastUpdate(now);
		forumDao.merge(forum);

		// Buscar a lista de respostas do originalComment
		List<Comment> repliesOriginalComment = commentDao.getListCommentReplies(idComment);

		// Adicionar reply a esta lista de respostas do originalComment
		repliesOriginalComment.add(reply);

		// Fazer merge do originalComment já com o reply dentro da sua lista de
		// respostas
		originalComment.setReplies(repliesOriginalComment);

		// Atualizar o comentário original coma nova lista de respostas
		commentDao.merge(originalComment);

		/*
		 * DTOReply replyDto = commentDao.convertEntityToDtoReply(reply); DTOUser
		 * userDto = userDao.convertEntityToDto(user); replyDto.setUserReply(userDto);
		 * return replyDto;
		 */

	}

	// Busca a lista de comentários de um determinado Forum
	public List<DTOComment> getCommentsList(String idForum) throws Exception {

		// Buscar lista de comentários de um determinado Forum com reply a false
		List<Comment> originalComments = commentDao.getCommentsList(Integer.parseInt(idForum));

		// System.out.println("originalComments vindos da bd");// ok traz bem
		// System.out.println(originalComments);

		// Listas auxiliares para aresposta
		List<DTOComment> commentsFinalDto = new ArrayList<DTOComment>();

		// Para cada comentário original
		for (Comment comment : originalComments) {
			// System.out.println("entrei no for");// ok traz bem
			// Buscar sua lista de respostas
			List<Comment> repliesComment = commentDao.getListCommentReplies(comment.getId());

			// System.out.println("replies do comentário original " + comment);
			// System.out.println(repliesComment);

			// int counter = 0;
			// Tranformar o comment original para Dto
			DTOComment commentDto = commentDao.convertEntityToDto(comment);

			DTOUser userOwner = userDao.convertEntityToDto(comment.getCommentOwner());
			commentDto.setOwner(userOwner);

			if (repliesComment.get(0) != null) {// se existirem respostas ao comentário

				repliesComment.removeIf(reply -> reply.isSoftDelete() == true);
				List<DTOReply> repliesDto = new ArrayList<DTOReply>();

				// Percorrer e Transformar as respostas ao comment em DTO
				for (Comment replyEntity : repliesComment) {

					DTOReply replyDto = commentDao.convertEntityToDtoReply(replyEntity);

					DTOUser ownerReply = userDao.convertEntityToDto(replyEntity.getCommentOwner());
					replyDto.setUserReply(ownerReply);

					// System.out.println("repliesDto " + replyDto);

					// Colocar a resposta na lista de respostas do comentario original
					repliesDto.add(replyDto);
				}

				// System.out.println("repliesComment.size() " + repliesComment.size());
				commentDto.setTotalReplies(repliesComment.size());
				commentDto.setRepliesDto(repliesDto);
			} // fim do for

			// Colocar o comentario original com suas respostas na lista que seguirá para o
			// frontend
			commentsFinalDto.add(commentDto);
		}

		// System.out.println("commentsFinalDto " + commentsFinalDto);
		return commentsFinalDto;
	}

	// Verificar se user é admin do sistema ou se user é owner/escreveu o comentário
	// e já verificar se o comentário está softDelete
	public boolean checkAuthorizationToEdit(String emailSession, String idCommentToEdit) throws Exception {

		Comment comment = commentDao.find(Integer.parseInt(idCommentToEdit));

		// Se comentário tem softDelete a true
		if (comment.isSoftDelete()) {
			return false;
		}

		User loggedUser = userDao.find(emailSession);

		// verificar se o user logado é um admin OU o owner do comentário
		if (loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)
				|| comment.getCommentOwner().getEmail().equals(loggedUser.getEmail())) {
			return true;
		}
		return false;
	}

	// método para editar o comentário
	public void editComment(int id, DTOComment commentDto) throws Exception {
		Comment comment = commentDao.find(id);
		comment.setContent(commentDto.getContentDto());
		comment.setId(id);

		Forum forum = comment.getForumWhereCommented();
		Timestamp now = new Timestamp(System.currentTimeMillis());
		forum.setLastUpdate(now);

		// Atualizar o comentário na bd
		commentDao.merge(comment);
		forumDao.merge(forum);

	}

	// SoftDelete - pode ser feito por um admin, pelo dono do Forum ou pelo dono do
	// comentario
	public boolean checkAuthorizationToSoftDelete(String emailSession, String idCommentToEdit) {
		User loggedUser = userDao.find(emailSession);

		System.out.println("checkAuthorizationToSoftDelete");

		// verificar se o user logado é um admin
		if (loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {
			return true;

			// verificar se o user logado é dono do Forum onde este comentario foi postado
			// ou admin ou dono do comentário
			// vou buscar o comentário SOMENTE se precisar com certeza, para evitar gasto de
			// recursos a toa
		} else {
			Comment comment = commentDao.find(Integer.parseInt(idCommentToEdit));
			if (comment.getForumWhereCommented().getOwner().getEmail().equals(loggedUser.getEmail())
					|| comment.getCommentOwner().getEmail().equals(loggedUser.getEmail())) {
				return true;
			}
			return false;
		}
	}

	// SoftDelete - admin ou dono do Forum - se Comment original, preciso colocar o
	// sofDelete a true também suas replies
	public void softDeleteComment(int id) throws Exception {

		System.out.println("softDeleteComment service");
		Comment comment = commentDao.find(id);
		comment.setSoftDelete(true);// comentário original

		// Caso seja um comentário original, ou seja, reply "false"
		if (!comment.isReply()) {

			// buscar a lista de respostas do comentário
			List<Comment> replies = commentDao.getListCommentReplies(comment.getId());

			// colocar todas as replies como softDelete true
			if (replies.get(0) != null) {// se existirem respostas ao comentário
				for (Comment reply : replies) {
					reply.setSoftDelete(true);
					commentDao.merge(reply);
				}
				// Atualizar a lista de replies do comentário
				comment.setReplies(replies);
			}
		}
		commentDao.merge(comment);
	}
}
