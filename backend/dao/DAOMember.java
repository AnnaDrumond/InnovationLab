package pt.uc.dei.projfinal.dao;

import java.util.List;

import javax.ejb.Stateless;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import pt.uc.dei.projfinal.entity.Member;
import pt.uc.dei.projfinal.entity.Project;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.Member.MemberStatus;

@Stateless
public class DAOMember extends AbstractDao<Member> {

	private static final long serialVersionUID = 1L;

	public DAOMember() {
		super(Member.class);
	}

	public Member convertToEntity(User user, Project project) {
		Member member = new Member();
		member.setProject(project);
		member.setUser(user);
		return member;
	}

	public Member findMember(String email, int projectId) {
		try {

			final CriteriaQuery<Member> criteriaQuery = em.getCriteriaBuilder().createQuery(Member.class);

			Root<Member> rootMember = criteriaQuery.from(Member.class);

			criteriaQuery.select(rootMember)
					.where(em.getCriteriaBuilder().and(
							em.getCriteriaBuilder().equal(rootMember.get("user").get("email"), email),
							em.getCriteriaBuilder().equal(rootMember.get("project").get("id"), projectId)));

			return em.createQuery(criteriaQuery).getSingleResult();

		} catch (Exception e) {
			return null;
		}
	}

	public List<Member> getAvailableUsers() {
		try {

			final CriteriaQuery<Member> criteriaQuery = em.getCriteriaBuilder().createQuery(Member.class);

			Root<Member> member = criteriaQuery.from(Member.class);

			Predicate one = em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.ADMINISTRATOR),
					em.getCriteriaBuilder().equal(member.get("project").get("softDelete"), false),
					em.getCriteriaBuilder().equal(member.get("project").get("active"), true));

			Predicate two = em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.PARTICIPATOR),
					em.getCriteriaBuilder().equal(member.get("project").get("softDelete"), false),
					em.getCriteriaBuilder().equal(member.get("project").get("active"), true));
			
			
			

			criteriaQuery.select(member).where(em.getCriteriaBuilder().or(one, two));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	public List<Member> getMembersAccordingToType(int projectId, MemberStatus status) {
		try {

			final CriteriaQuery<Member> criteriaQuery = em.getCriteriaBuilder().createQuery(Member.class);
			Root<Member> member = criteriaQuery.from(Member.class);

			criteriaQuery.select(member)
					.where(em.getCriteriaBuilder().and(
							em.getCriteriaBuilder().equal(member.get("memberStatus"), status),
							em.getCriteriaBuilder().equal(member.get("project").get("id"), projectId)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

}
