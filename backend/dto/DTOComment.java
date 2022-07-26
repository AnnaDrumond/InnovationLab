package pt.uc.dei.projfinal.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class DTOComment implements Serializable {
	private static final long serialVersionUID = 1L;

	private String contentDto;

	private DTOUser owner;
	// 6.5.4 Todos os comentários têm que estar identificados com o nome ou alcunha
	// do autor e a data/hora da sua criação.
	private String creationDate;
	private int forumId;
	private int idOriginalComment;
	private int totalReplies;
	
	private List <DTOReply> repliesDto = new ArrayList<DTOReply>();

	public DTOComment() {

	}

	public String getContentDto() {
		return contentDto;
	}

	public void setContentDto(String contentDto) {
		this.contentDto = contentDto;
	}

	public int getForumId() {
		return forumId;
	}

	public void setForumId(int forumId) {
		this.forumId = forumId;
	}

	public DTOUser getOwner() {
		return owner;
	}

	public void setOwner(DTOUser owner) {
		this.owner = owner;
	}

	public String getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(String creationDate) {
		this.creationDate = creationDate;
	}

	public List<DTOReply> getRepliesDto() {
		return repliesDto;
	}

	public void setRepliesDto(List<DTOReply> repliesDto) {
		this.repliesDto = repliesDto;
	}

	public int getIdOriginalComment() {
		return idOriginalComment;
	}

	public void setIdOriginalComment(int idOriginalComment) {
		this.idOriginalComment = idOriginalComment;
	}

	public int getTotalReplies() {
		return totalReplies;
	}

	public void setTotalReplies(int totalReplies) {
		this.totalReplies = totalReplies;
	}

	@Override
	public String toString() {
		return "DTOComment [idOriginalComment=" + idOriginalComment + ", repliesDto=" + repliesDto + "]";
	}
	
	
}
