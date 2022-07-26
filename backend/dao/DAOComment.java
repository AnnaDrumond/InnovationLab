package pt.uc.dei.projfinal.dao;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.List;

import javax.ejb.Stateless;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.JoinType;
import javax.persistence.criteria.Root;

import pt.uc.dei.projfinal.dto.DTOComment;
import pt.uc.dei.projfinal.dto.DTOReply;
import pt.uc.dei.projfinal.entity.Comment;
import pt.uc.dei.projfinal.entity.Forum;

@Stateless
public class DAOComment extends AbstractDao<Comment> {

	private static final long serialVersionUID = 1L;

	public DAOComment() {
		super(Comment.class);
	}

	public Comment convertDtoToEntity(DTOComment dtoComment) {
		Comment comment = new Comment();
		comment.setContent(dtoComment.getContentDto());
		return comment;
	}

	public DTOReply convertEntityToDtoReply(Comment comment) {

		DTOReply dto = new DTOReply();
		dto.setContentDto(comment.getContent());
		dto.setId(comment.getId());
		Timestamp timestamp = comment.getCreationDate();
		dto.setCreationDate(new SimpleDateFormat("dd/MM/yyyy HH:mm:ss").format(timestamp));

		return dto;
	}

	public DTOComment convertEntityToDto(Comment comment) {

		DTOComment dto = new DTOComment();
		dto.setContentDto(comment.getContent());
		Timestamp timestamp = comment.getCreationDate();
		dto.setCreationDate(new SimpleDateFormat("dd/MM/yyyy HH:mm:ss").format(timestamp));
		dto.setForumId(comment.getForumWhereCommented().getId());
		dto.setIdOriginalComment(comment.getId());
		return dto;
	}

	/**
	 * Buscar lista de respostas de um determinado comentário Citeria API relação
	 * recursiva/recursivo
	 * 
	 * @param idComment
	 * @return
	 */
	public List<Comment> getListCommentReplies(int idComment) {

		try {

			final CriteriaQuery<Comment> criteriaQuery = em.getCriteriaBuilder().createQuery(Comment.class);
			Root<Comment> commentRoot = criteriaQuery.from(Comment.class);
			Join<Comment, Comment> replies = commentRoot.join("replies", JoinType.LEFT);
			criteriaQuery.select(replies).where(em.getCriteriaBuilder().equal(commentRoot.get("id"), idComment));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}


	/**
	 * Buscar lista de comentarios originais de um determinado Forum
	 * Um comentário original pode ter várias respostas
	 * Comentário original tem o atributo "reply" como false.
	 * @param idForum - id da ideia/necessidade a ser pesquisada
	 * @return
	 */
	public List<Comment> getCommentsList(int idForum) {

		System.out.println("getCommentsList dao");
		try {

			final CriteriaQuery<Comment> criteriaQuery = em.getCriteriaBuilder().createQuery(Comment.class);
			Root<Comment> commentRoot = criteriaQuery.from(Comment.class);
			Join<Comment, Forum> forum = commentRoot.join("forumWhereCommented");

			criteriaQuery.select(commentRoot).where(
					em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(forum.get("id"), idForum)),
					em.getCriteriaBuilder().equal(commentRoot.get("reply"), false),
					em.getCriteriaBuilder().equal(commentRoot.get("softDelete"), false));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

}
