package pt.uc.dei.projfinal.dto;

import java.io.Serializable;
import java.sql.Timestamp;

import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement
public class DTOProject implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private int id;
	private String title;
	private String description;
	private String necessaryResources;
	private String executionPlan;
	private String creationDate;
	private String lastUpdate;
	private int memberVacancies;
	private int totalMembers;
	private long votes;
	private boolean active;
	private DTOUser ownerProj;
	private boolean isFavorited;
	private boolean isVoted;
	
	public DTOProject() {
		
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getNecessaryResources() {
		return necessaryResources;
	}

	public void setNecessaryResources(String necessaryResources) {
		this.necessaryResources = necessaryResources;
	}

	public String getExecutionPlan() {
		return executionPlan;
	}

	public void setExecutionPlan(String executionPlan) {
		this.executionPlan = executionPlan;
	}

	public DTOUser getOwnerProj() {
		return ownerProj;
	}

	public void setOwnerProj(DTOUser ownerProj) {
		this.ownerProj = ownerProj;
	}

	public long getVotes() {
		return votes;
	}

	public void setVotes(long votes) {
		this.votes = votes;
	}



	public String getCreationDate() {
		return creationDate;
	}

	public void setCreationDate(String creationDate) {
		this.creationDate = creationDate;
	}

	public int getMemberVacancies() {
		return memberVacancies;
	}

	public void setMemberVacancies(int memberVacancies) {
		this.memberVacancies = memberVacancies;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public int getTotalMembers() {
		return totalMembers;
	}

	public void setTotalMembers(int totalMembers) {
		this.totalMembers = totalMembers;
	}

	public String getLastUpdate() {
		return lastUpdate;
	}

	public void setLastUpdate(String lastUpdate) {
		this.lastUpdate = lastUpdate;
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
	
	

}
