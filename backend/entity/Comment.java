package pt.uc.dei.projfinal.entity;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.Collection;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.Table;
import javax.validation.constraints.NotBlank;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "Comments")
public class Comment implements Serializable {
	private static final long serialVersionUID = 1L;

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private int id;

	@NotBlank // não pode estar nulo e nem vazio
	@Column(name = "content", length=10000000)
	private String content;

	@CreationTimestamp
	@Column(name = "creationDate", nullable = false, updatable = false, insertable = false, columnDefinition = "TIMESTAMP default CURRENT_TIMESTAMP")
	private Timestamp creationDate;

	@Column(name = "reply")
	private boolean reply;

	@Column(name = "softDelete")
	private boolean softDelete;

	@OneToMany
	private List<Comment> replies;

	@ManyToOne
	private User commentOwner;

	// ideia/necessidade onde foi realizado o comentário
	@ManyToOne
	private Forum forumWhereCommented;

	public Comment() {

	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public Timestamp getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(Timestamp creationDate) {
		this.creationDate = creationDate;
	}

	public boolean isReply() {
		return reply;
	}

	public void setReply(boolean reply) {
		this.reply = reply;
	}

	public List<Comment> getReplies() {
		return replies;
	}

	public void setReplies(List<Comment> replies) {
		this.replies = replies;
	}

	public User getCommentOwner() {
		return commentOwner;
	}

	public void setCommentOwner(User commentOwner) {
		this.commentOwner = commentOwner;
	}

	public Forum getForumWhereCommented() {
		return forumWhereCommented;
	}

	public void setForumWhereCommented(Forum forumWhereCommented) {
		this.forumWhereCommented = forumWhereCommented;
	}

	public boolean isSoftDelete() {
		return softDelete;
	}

	public void setSoftDelete(boolean softDelete) {
		this.softDelete = softDelete;
	}

	@Override
	public String toString() {
		return "Comment [id=" + id + "] ------  ";
	}

}
