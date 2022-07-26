package pt.uc.dei.projfinal.dto;

import java.io.Serializable;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class DTOMessageComplete implements Serializable {
	private static final long serialVersionUID = 1L;

	private String sendDate;
	private String content;
	private boolean readed;
	private int id;
	private DTOUser receiver;
	private DTOUser sender;

	public DTOMessageComplete() {

	}

	public String getSendDate() {
		return sendDate;
	}

	public void setSendDate(String sendDate) {
		this.sendDate = sendDate;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public boolean isReaded() {
		return readed;
	}

	public void setReaded(boolean readed) {
		this.readed = readed;
	}

	public DTOUser getReceiver() {
		return receiver;
	}

	public void setReceiver(DTOUser receiver) {
		this.receiver = receiver;
	}

	public DTOUser getSender() {
		return sender;
	}

	public void setSender(DTOUser sender) {
		this.sender = sender;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

}
