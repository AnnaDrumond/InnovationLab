package pt.uc.dei.projfinal.dao;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Collection;

import javax.ejb.Stateless;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import pt.uc.dei.projfinal.dto.DTOMessage;
import pt.uc.dei.projfinal.dto.DTOMessageComplete;
import pt.uc.dei.projfinal.entity.Forum;
import pt.uc.dei.projfinal.entity.Message;
import pt.uc.dei.projfinal.entity.User;

@Stateless
public class DAOMessage extends AbstractDao<Message> {
	private static final long serialVersionUID = 1L;

	public DAOMessage() {
		super(Message.class);
	}

	public Message convertDtoToEntity(DTOMessage messageDto) {
		Message message = new Message();
		message.setContent(messageDto.getContent());
		return message;
	}

	public DTOMessageComplete convertEntityToDto(Message message) {

		DTOMessageComplete dto = new DTOMessageComplete();
		Timestamp timestamp = message.getSendDate();
		dto.setSendDate(new SimpleDateFormat("dd/MM HH:mm").format(timestamp));
		dto.setContent(message.getContent());
		dto.setReaded(message.isReaded());
		dto.setId(message.getId());
		return dto;
	}

	// Buscar lista de mensagens recebidas de um determinado user
	// ordenas por data/hora
	public Collection<Message> getListReceivedMessages(String emailReceiver) {

		System.out.println("getListReceivedMessages - dao");

		try {

			final CriteriaQuery<Message> criteriaQuery = em.getCriteriaBuilder().createQuery(Message.class);
			Root<Message> root = criteriaQuery.from(Message.class);
			Join<Message, User> user = root.join("receiver");

			criteriaQuery.orderBy(em.getCriteriaBuilder().desc(root.get("sendDate")));

			// vai buscar receivedMessageList
			criteriaQuery.select(root).where(em.getCriteriaBuilder().equal(user.get("email"), emailReceiver));

			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
			System.out.println("catch do received dao");
			return null;
		}
	}

	// Buscar lista de mensagens enviadas de um determinado user
	// ordenadas po data/hora
	public Collection<Message> getListSentMessages(String emailSender) {

		System.out.println("getListSentMessages");

		try {

			final CriteriaQuery<Message> criteriaQuery = em.getCriteriaBuilder().createQuery(Message.class);
			Root<Message> root = criteriaQuery.from(Message.class);
			Join<Message, User> user = root.join("sender");

			criteriaQuery.orderBy(em.getCriteriaBuilder().desc(root.get("sendDate")));
			// vai buscar sentMessageList
			criteriaQuery.select(root).where(em.getCriteriaBuilder().equal(user.get("email"), emailSender));

			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
			return null;
		}
	}

	public Collection<Message> getAllMessagesBetweenLoggedUserAndOtherUser(String emailLoggedUser,
			String emailToConsult) {

		try {

			final CriteriaQuery<Message> criteriaQuery = em.getCriteriaBuilder().createQuery(Message.class);
			Root<Message> root = criteriaQuery.from(Message.class);
			Join<Message, User> sender = root.join("sender");
			Join<Message, User> receiver = root.join("receiver");

			// Ordenar por data/hora
			criteriaQuery.orderBy(em.getCriteriaBuilder().desc(root.get("sendDate")));

			// O Sender é o user logado OU o sender é o outro user
			Predicate predicateSender = em.getCriteriaBuilder().or(
					em.getCriteriaBuilder().equal(sender.get("email"), emailLoggedUser),
					em.getCriteriaBuilder().equal(sender.get("email"), emailToConsult));

			// O Receiver é o user logado OU o sender é o outro user
			Predicate predicateReceiver = em.getCriteriaBuilder().or(
					em.getCriteriaBuilder().equal(receiver.get("email"), emailLoggedUser),
					em.getCriteriaBuilder().equal(receiver.get("email"), emailToConsult));

			criteriaQuery.where(em.getCriteriaBuilder().and(predicateSender, predicateReceiver));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// Método para buscar a quantidade de votos (users que votaram) em um
	// determinado Forum
	public long getTotalMessagesUnread(String email) {

		try {

			CriteriaQuery<Long> cqCount = em.getCriteriaBuilder().createQuery(Long.class);
			CriteriaQuery<Message> cqEntity = em.getCriteriaBuilder().createQuery(Message.class);

			Root<Message> message = cqCount.from(cqEntity.getResultType());
			// Quero contar as mensagens não lidas recebidas por um determinado user
			Join<Message, User> user = message.join("receiver");

			cqCount.select(em.getCriteriaBuilder().count(message))
					.where(em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(message.get("readed"), false),
							em.getCriteriaBuilder().equal(user.get("email"), email)));

			return em.createQuery(cqCount).getSingleResult();

		} catch (Exception e) {
			e.printStackTrace();
			return 0;
		}
	}
	

}
