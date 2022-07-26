package pt.uc.dei.projfinal.dao;

import javax.ejb.Stateless;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Root;

import pt.uc.dei.projfinal.entity.Configurations;

@Stateless
public class DAOConfigurations extends AbstractDao<Configurations>{
	
	private static final long serialVersionUID = 1L;
	
	public DAOConfigurations() {
		super(Configurations.class);
	}
	
	/**
	 * Devolve a configuração guardada na base de dados através da sua key
	 * A key pode ser o timeOut ou o salt armazendos na base de dados
	 * @param key
	 * @return
	 */
	public Configurations getConfiguration(String key) {
		try {

			final CriteriaQuery<Configurations> criteriaQuery = em.getCriteriaBuilder().createQuery(Configurations.class);
			Root<Configurations> config = criteriaQuery.from(Configurations.class);
			criteriaQuery.select(config).where(em.getCriteriaBuilder().equal(config.get("keyword"), key));
			return em.createQuery(criteriaQuery).getSingleResult();
		} catch (Exception e) {
			return null;
		}
	}

}
