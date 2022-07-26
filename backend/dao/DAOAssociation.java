package pt.uc.dei.projfinal.dao;

import java.util.Collection;

import javax.ejb.Stateless;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.Root;

import pt.uc.dei.projfinal.dto.DTOAssociation;
import pt.uc.dei.projfinal.entity.Association;
import pt.uc.dei.projfinal.entity.Forum;

@Stateless
public class DAOAssociation extends AbstractDao<Association> {

	private static final long serialVersionUID = 1L;

	public DAOAssociation() {
		super(Association.class);
	}

	public Association convertDtoToEntity(DTOAssociation dto) {
		Association association = new Association();
		association.setDescription(dto.getDescription());
		return association;
	}

	public Association convertDtoToEntity(Association association, DTOAssociation dto) {
		association.setDescription(dto.getDescription());
		return association;
	}

	public DTOAssociation convertEntityToDto(Association association) {
		DTOAssociation dto = new DTOAssociation();
		dto.setId(association.getId());
		dto.setDescription(association.getDescription());
		return dto;
	}

	/**
	 * Busca lista de associações
	 * 
	 * @param idForum - id da ideia/necessidade a ser consultada
	 * @param join - parametro de união entrea as tabelas
	 * @return
	 */
	public Collection<Association> getList(int idForum, String join) {
		try {
			final CriteriaQuery<Association> criteriaQuery = em.getCriteriaBuilder().createQuery(Association.class);
			Root<Association> p = criteriaQuery.from(Association.class);

			Join<Association, Forum> join1 = p.join("associatedForum");
			Join<Association, Forum> join2 = p.join("forumToAssociate");

			criteriaQuery.select(p)
					.where(em.getCriteriaBuilder().or(em.getCriteriaBuilder().equal(join1.get("id"), idForum),
							em.getCriteriaBuilder().equal(join2.get("id"), idForum)));

			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
			return null;
		}
	}

}
