package pt.uc.dei.projfinal.dao;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Collection;

import javax.ejb.Stateless;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.Root;

import pt.uc.dei.projfinal.dto.DTONotification;
import pt.uc.dei.projfinal.entity.Member;
import pt.uc.dei.projfinal.entity.Message;
import pt.uc.dei.projfinal.entity.Notification;
import pt.uc.dei.projfinal.entity.Project;
import pt.uc.dei.projfinal.entity.User;

@Stateless
public class DAONotification extends AbstractDao<Notification> {

	private static final long serialVersionUID = 1L;

	public DAONotification() {
		super(Notification.class);
	}

	// método para converter a notificação em dto
	public DTONotification convertEntityToDto(Notification notification) {
		DTONotification dto = new DTONotification();
		dto.setId(notification.getId());
		dto.setText(notification.getText());
		dto.setTypeNotification(notification.getTypeNotification());
		dto.setSeen(notification.isSeen());
		dto.setIdProject(notification.getIdProject());
		Timestamp timestamp = notification.getCreationDate();
		dto.setUserReferenced(notification.getUserReferenced());
		dto.setCreationDate(new SimpleDateFormat("dd/MM/yyyy HH:mm:ss").format(timestamp));
		return dto;
	}

	// método para ir buscar a lista de notificações de um determinado utilizador
	public Collection<Notification> getUserNotification(String email) {
		try {

			final CriteriaQuery<Notification> criteriaQuery = em.getCriteriaBuilder().createQuery(Notification.class);
			Root<Notification> rootNotification = criteriaQuery.from(Notification.class);
			Join<Notification, User> joinUser = rootNotification.join("ownerNot");
			// Ordenar por data/hora
			criteriaQuery.orderBy(em.getCriteriaBuilder().desc(rootNotification.get("creationDate")));
			criteriaQuery.select(rootNotification).where(em.getCriteriaBuilder().equal(joinUser.get("email"), email));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			
			return null;
		}
	}

	// método para ir buscar uma determinada notificação conforme o user a quem
	// pertence, o user a que se refere e o id do projeto
	public Notification getNotification(String emailOwner, String emailReferenced, int projectId) {
		try {

			final CriteriaQuery<Notification> criteriaQuery = em.getCriteriaBuilder().createQuery(Notification.class);
			Root<Notification> rootNotification = criteriaQuery.from(Notification.class);
			Join<Notification, User> joinUser = rootNotification.join("ownerNot");

			criteriaQuery.select(rootNotification).where(
					em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(joinUser.get("email"), emailOwner)),
					em.getCriteriaBuilder().equal(rootNotification.get("idProject"), projectId),
					em.getCriteriaBuilder().equal(rootNotification.get("userReferenced"), emailReferenced));

			return em.createQuery(criteriaQuery).getSingleResult();

		} catch (Exception e) {
		
			return null;
		}
	}

	// método para obter todas as notificações relativas a um determinado projeto
	public Collection<Notification> getNotificationsOfProject(int projectId) {
		try {

			final CriteriaQuery<Notification> criteriaQuery = em.getCriteriaBuilder().createQuery(Notification.class);
			Root<Notification> rootNotification = criteriaQuery.from(Notification.class);

			criteriaQuery.select(rootNotification)
					.where(em.getCriteriaBuilder().equal(rootNotification.get("idProject"), projectId));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
		
			return null;
		}
	}

	
	// determinado user
	public long getTotalNotificationsUnread(String email) {

		try {

			CriteriaQuery<Long> cqCount = em.getCriteriaBuilder().createQuery(Long.class);
			CriteriaQuery<Notification> cqEntity = em.getCriteriaBuilder().createQuery(Notification.class);

			Root<Notification> notification = cqCount.from(cqEntity.getResultType());
			// Quero contar as mensagens não lidas recebidas por um determinado user
			Join<Notification, User> user = notification.join("ownerNot");

			cqCount.select(em.getCriteriaBuilder().count(notification))
					.where(em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(notification.get("seen"), false),
							em.getCriteriaBuilder().equal(user.get("email"), email)));

			return em.createQuery(cqCount).getSingleResult();

		} catch (Exception e) {
			return 0;
		}
	}
}
