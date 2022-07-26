package pt.uc.dei.projfinal.entity;

import java.io.Serializable;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.PrimaryKeyJoinColumn;

@Entity
//@IdClass(MemberPK.class)
public class Member implements Serializable {
	private static final long serialVersionUID = 1L;
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id")
	private int id;
	
	public enum MemberStatus{
		SOLICITOR, INVITED, ADMINISTRATOR, PARTICIPATOR
	}
	
	@Enumerated(EnumType.STRING)
	private MemberStatus memberStatus;
	
	/*@Id
	@Column(name="project_id", updatable = false, insertable = false)
	private int projectId;
	
	@Id
	@Column(name="user_email", updatable = false, insertable = false)
	private String userEmail;*/
	
	
	@ManyToOne
	@JoinColumn(name="projectid", referencedColumnName="id")
	private Project project;
	
	@ManyToOne
	@JoinColumn(name="useremail", referencedColumnName="email")
	private User user;
	
	public Member() {
		
	}

	/*public int getProjectId() {
		return projectId;
	}

	public void setProjectId(int projectId) {
		this.projectId = projectId;
	}

	public String getUserEmail() {
		return userEmail;
	}

	public void setUserEmail(String userEmail) {
		this.userEmail = userEmail;
	}*/

	public Project getProject() {
		return project;
	}

	public void setProject(Project project) {
		//this.projectId = project.getId();
		this.project = project;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		//this.userEmail = user.getEmail();
		this.user = user;
	}

	public MemberStatus getMemberStatus() {
		return memberStatus;
	}

	public void setMemberStatus(MemberStatus memberStatus) {
		this.memberStatus = memberStatus;
	}

	@Override
	public String toString() {
		return "Member [memberStatus=" + memberStatus + ", project=" + project + ", user=" + user + "]";
	}
	
	
	
	
}
