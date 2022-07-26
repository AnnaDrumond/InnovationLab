package pt.uc.dei.projfinal.dto;

import java.io.Serializable;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class DTOReply implements Serializable {
	private static final long serialVersionUID = 1L;

	private String contentDto;

	private int id;
private DTOUser userReply;

	// 6.5.4 Todos os comentários têm que estar identificados com o nome ou alcunha
	// do autor e a data/hora da sua criação.
	private String creationDate;
	

	public DTOReply() {

	}

	public String getContentDto() {
		return contentDto;
	}

	public void setContentDto(String contentDto) {
		this.contentDto = contentDto;
	}

	public DTOUser getUserReply() {
		return userReply;
	}

	public void setUserReply(DTOUser userReply) {
		this.userReply = userReply;
	}

	public String getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(String creationDate) {
		this.creationDate = creationDate;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	@Override
	public String toString() {
		return "DTOReply [id=" + id + "]";
	}
	
	
	
}
