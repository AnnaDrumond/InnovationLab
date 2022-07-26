package pt.uc.dei.projfinal.dto;

import java.io.Serializable;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class DTOMessage implements Serializable{
	private static final long serialVersionUID = 1L;
	
	private String content;
	private boolean readed;
	private String emailReceiver;
	private String emailSender;
	
	
	public DTOMessage() {
		super();
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


	public String getEmailReceiver() {
		return emailReceiver;
	}


	public void setEmailReceiver(String emailReceiver) {
		this.emailReceiver = emailReceiver;
	}


	public String getEmailSender() {
		return emailSender;
	}


	public void setEmailSender(String emailSender) {
		this.emailSender = emailSender;
	}
	
	
	
	
	

}
