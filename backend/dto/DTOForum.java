package pt.uc.dei.projfinal.dto;

import java.io.Serializable;
import java.util.Collection;

import javax.xml.bind.annotation.XmlRootElement;

import pt.uc.dei.projfinal.entity.Forum.ForumType;

@XmlRootElement
public class DTOForum implements Serializable {
	private static final long serialVersionUID = 1L;

	private ForumType type;
	private String description;
	private DTOUser userOwner;
	private String creationDate;
	private String lastUpDate;
	private int totalVotes;
	private int id;
	private String title;
	private boolean isFavorited;
	private boolean isVoted;
	private int totalComments;
	

	public DTOForum() {

	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public ForumType getType() {
		return type;
	}

	public void setType(ForumType type) {
		this.type = type;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public DTOUser getUserOwner() {
		return userOwner;
	}

	public void setUserOwner(DTOUser userOwner) {
		this.userOwner = userOwner;
	}

	public String getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(String creationDate) {
		this.creationDate = creationDate;
	}

	public String getLastUpDate() {
		return lastUpDate;
	}

	public void setLastUpDate(String lastUpDate) {
		this.lastUpDate = lastUpDate;
	}

	public int getTotalVotes() {
		return totalVotes;
	}

	public void setTotalVotes(int totalVotes) {
		this.totalVotes = totalVotes;
	}

	public boolean isFavorited() {
		return isFavorited;
	}

	public void setFavorited(boolean isFavorited) {
		this.isFavorited = isFavorited;
	}

	public boolean isVoted() {
		return isVoted;
	}

	public void setVoted(boolean isVoted) {
		this.isVoted = isVoted;
	}

	public int getTotalComments() {
		return totalComments;
	}

	public void setTotalComments(int totalComments) {
		this.totalComments = totalComments;
	}

}
