package pt.uc.dei.projfinal.dto;

import java.io.Serializable;

import javax.xml.bind.annotation.XmlRootElement;

import pt.uc.dei.projfinal.entity.Skill.SkillType;

@XmlRootElement
public class DTOSkill implements Serializable {
	private static final long serialVersionUID = 1L;
	
	private String title;
	private SkillType skillType;
	private int idSkill;
	
	public DTOSkill() {
		
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public SkillType getSkillType() {
		return skillType;
	}

	public void setSkillType(SkillType skillType) {
		this.skillType = skillType;
	}

	public int getIdSkill() {
		return idSkill;
	}

	public void setIdSkill(int idSkill) {
		this.idSkill = idSkill;
	}
	
	

}
