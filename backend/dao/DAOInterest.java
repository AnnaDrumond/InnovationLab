package pt.uc.dei.projfinal.dao;

import java.util.Collection;

import javax.ejb.Stateless;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.Root;

import pt.uc.dei.projfinal.dto.DTOInterest;
import pt.uc.dei.projfinal.entity.Forum;
import pt.uc.dei.projfinal.entity.Interest;
import pt.uc.dei.projfinal.entity.Project;
import pt.uc.dei.projfinal.entity.Skill;
import pt.uc.dei.projfinal.entity.User;

@Stateless
public class DAOInterest extends AbstractDao<Interest> {

	private static final long serialVersionUID = 1L;

	public DAOInterest() {
		super(Interest.class);
	}

	public Interest convertDtoToEntity(DTOInterest dtoInterest) {
		Interest interest = new Interest();
		interest.setTitle(dtoInterest.getTitle());
		return interest;
	}

	public DTOInterest convertEntityToDto(Interest interest) {
		DTOInterest interestDto = new DTOInterest();
		interestDto.setTitle(interest.getTitle());
		interestDto.setIdInterest(interest.getId());
		return interestDto;
	}

	public Collection<User> getAssociatedUsers(int interestId, String join) {
		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> p = criteriaQuery.from(User.class);
			Join<User, Interest> n = p.join(join);
			criteriaQuery.select(p).where(em.getCriteriaBuilder().equal(n.get("id"), interestId));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	public Collection<Forum> getAssociatedForums(int interestId, String join) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, Interest> interest = forum.join(join);
			criteriaQuery.select(forum).where(em.getCriteriaBuilder().equal(interest.get("id"), interestId));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	public Collection<Interest> searchInterestsBySearchKey(String searchKey) {
		// TODO Auto-generated method stub
		try {
			final CriteriaQuery<Interest> criteriaQuery = em.getCriteriaBuilder().createQuery(Interest.class);

			Root<Interest> root = criteriaQuery.from(Interest.class);
			criteriaQuery.select(root)
					.where(em.getCriteriaBuilder().or(
							em.getCriteriaBuilder().like(root.get("title"), '%' + searchKey + '%'),
							em.getCriteriaBuilder().like(root.get("title"), '%' + searchKey),
							em.getCriteriaBuilder().like(root.get("title"), searchKey + '%')));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	// Buscar interesse pelo titulo
	public Interest getInterestByTitle(String title) {
		try {

			final CriteriaQuery<Interest> criteriaQuery = em.getCriteriaBuilder().createQuery(Interest.class);
			Root<Interest> interest = criteriaQuery.from(Interest.class);
			criteriaQuery.select(interest).where(em.getCriteriaBuilder().equal(interest.get("title"), title));
			return em.createQuery(criteriaQuery).getSingleResult();

		} catch (Exception e) {
			return null;
		}
	}
	
	//método para obter os interesses associados ao forum
		public Collection<Interest> getAssociatedInterestsForum(int forumId) {
			try {

				final CriteriaQuery<Interest> criteriaQuery = em.getCriteriaBuilder().createQuery(Interest.class);
				Root<Interest> interest = criteriaQuery.from(Interest.class);			
				Join<Interest,Forum> forum = interest.join("forumThatHaveThisInterest");

				criteriaQuery.select(interest).where(em.getCriteriaBuilder().equal(forum.get("id"), forumId));
				return em.createQuery(criteriaQuery).getResultList();

			} catch (Exception e) {
				return null;
			}
			
		}
}
