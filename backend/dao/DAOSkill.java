package pt.uc.dei.projfinal.dao;

import java.util.Collection;

import javax.ejb.Stateless;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.Root;

import pt.uc.dei.projfinal.dto.DTOSkill;
import pt.uc.dei.projfinal.entity.Forum;
import pt.uc.dei.projfinal.entity.Project;
import pt.uc.dei.projfinal.entity.Skill;
import pt.uc.dei.projfinal.entity.User;

@Stateless
public class DAOSkill extends AbstractDao<Skill> {

	private static final long serialVersionUID = 1L;

	public DAOSkill() {
		super(Skill.class);
	}

	public Skill convertDtoToEntity(DTOSkill dtoSkill) {
		Skill skill = new Skill();
		skill.setTitle(dtoSkill.getTitle());
		skill.setSkillType(dtoSkill.getSkillType());
		return skill;
	}

	public DTOSkill convertEntityToDto(Skill skill) {
		DTOSkill dto = new DTOSkill();
		dto.setTitle(skill.getTitle());
		dto.setSkillType(skill.getSkillType());
		dto.setIdSkill(skill.getId());
		return dto;
	}

	// método para obter a lista users que tem aquela skill
	public Collection<User> getAssociatedUsers(int skillId, String join) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Skill> skill = user.join(join);
			criteriaQuery.select(user).where(em.getCriteriaBuilder().equal(skill.get("id"), skillId));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// método para obter a lista de forum que tem aquela skill
	public Collection<Forum> getAssociatedForum(int skillId, String join) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, Skill> skill = forum.join(join);
			criteriaQuery.select(forum).where(em.getCriteriaBuilder().equal(skill.get("id"), skillId));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// método para obter a lista de projetos que tem aquela skill
	public Collection<Project> getAssociatedProjects(int skillId, String join) {

		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> project = criteriaQuery.from(Project.class);
			Join<Project, Skill> skill = project.join(join);
			criteriaQuery.select(project).where(em.getCriteriaBuilder().equal(skill.get("id"), skillId));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	public Collection<Skill> searchSkillBySearchKey(String searchKey) {

		try {
			final CriteriaQuery<Skill> criteriaQuery = em.getCriteriaBuilder().createQuery(Skill.class);
			Root<Skill> root = criteriaQuery.from(Skill.class);
			criteriaQuery.select(root)
					.where(em.getCriteriaBuilder().or(
							em.getCriteriaBuilder().like(root.get("title"), '%' + searchKey + '%'),
							em.getCriteriaBuilder().like(root.get("title"), '%' + searchKey),
							em.getCriteriaBuilder().like(root.get("title"), searchKey + '%')));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	//Buscar Skill pelo titulo
	public Skill GetSkillByTitle(String title) {
		try {

			final CriteriaQuery<Skill> criteriaQuery = em.getCriteriaBuilder().createQuery(Skill.class);
			Root<Skill> skill = criteriaQuery.from(Skill.class);
			criteriaQuery.select(skill).where(em.getCriteriaBuilder().equal(skill.get("title"), title));
			return em.createQuery(criteriaQuery).getSingleResult();

		} catch (Exception e) {
			return null;
		}
	}

	//método ara obter as skills associadas ao projeto
	public Collection<Skill> getAssociatedSkillsProject(int projectId) {
		try {

			final CriteriaQuery<Skill> criteriaQuery = em.getCriteriaBuilder().createQuery(Skill.class);
			Root<Skill> skill = criteriaQuery.from(Skill.class);		
			Join<Skill,Project> project = skill.join("projectsThatHaveThisSkill");

			criteriaQuery.select(skill).where(em.getCriteriaBuilder().equal(project.get("id"), projectId));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
		
	}
	
	//método para obter as skills associadas ao forum
	public Collection<Skill> getAssociatedSkillsForum(int forumId) {
		try {

			final CriteriaQuery<Skill> criteriaQuery = em.getCriteriaBuilder().createQuery(Skill.class);
			Root<Skill> skill = criteriaQuery.from(Skill.class);		
			Join<Skill,Forum> forum = skill.join("forumThatHaveThisSkill");

			criteriaQuery.select(skill).where(em.getCriteriaBuilder().equal(forum.get("id"), forumId));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
		
	}

}
