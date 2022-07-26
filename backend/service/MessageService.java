package pt.uc.dei.projfinal.service;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;

import pt.uc.dei.projfinal.dao.DAOMessage;
import pt.uc.dei.projfinal.dao.DAOUser;
import pt.uc.dei.projfinal.dto.DTOMessage;
import pt.uc.dei.projfinal.dto.DTOMessageComplete;
import pt.uc.dei.projfinal.dto.DTOUser;
import pt.uc.dei.projfinal.entity.Message;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.User.UserType;

@RequestScoped
public class MessageService implements Serializable {
	private static final long serialVersionUID = 1L;

	@Inject
	DAOUser userDao;

	@Inject
	DAOMessage messageDao;

	public MessageService() {

	}

	public void sendMessage(DTOMessage dtoMessage, User sender, User receiver) throws Exception {
		// A(sender) envia mensagem para B (receiver)
		// User sender = userDao.find(dtoMessage.getEmailSender());// A
		// User receiver = userDao.find(dtoMessage.getEmailReceiver());// B

		System.out.println("sendMessage service com o dto " + dtoMessage);

		Message message = messageDao.convertDtoToEntity(dtoMessage);
		message.setSender(sender);// A
		message.setReceiver(receiver);// B
		messageDao.persist(message);// mensagem criada
		// Buscar lista de mensagens recebidas de B
		Collection<Message> receivedList = messageDao.getListReceivedMessages(receiver.getEmail());
		// Adicionar mensagem a lista de recebidos de B
		receivedList.add(message);
		// Atualizar B
		receiver.setReceivedMessageList(receivedList);
		userDao.merge(receiver);
		// Buscar lista de mensagens enviadas de A
		Collection<Message> sentList = messageDao.getListSentMessages(sender.getEmail());
		// Adicionar mensagem a lista de enviados de A
		sentList.add(message);
		// Atualizar A
		sender.setSentMessageList(sentList);
		userDao.merge(sender);
	}

	public Collection<DTOMessageComplete> searchBetweenUsersMessages(String emailLoggedUser, String emailToConsult)
			throws Exception {

		System.out.println("searchBetweenUsersMessages - service");

		Collection<Message> messages = messageDao.getAllMessagesBetweenLoggedUserAndOtherUser(emailLoggedUser,
				emailToConsult);
		Collection<DTOMessageComplete> messagesDto = new ArrayList<DTOMessageComplete>();

		for (Message message : messages) {

			DTOMessageComplete messageDto = messageDao.convertEntityToDto(message);
			DTOUser receiverDto = userDao.convertEntityToDto(message.getReceiver());
			DTOUser senderDto = userDao.convertEntityToDto(message.getSender());

			messageDto.setReceiver(receiverDto);
			messageDto.setSender(senderDto);
			messagesDto.add(messageDto);
		}
		return messagesDto;
	}

	public boolean changeMessageReadOrUnread(Message message) throws Exception {
		if (message != null) {

			if (message.isReaded() == false) {// se não lida
				message.setReaded(true);// muda para lida
			} else {// se lida
				message.setReaded(false);// muda para não lida
			}
			messageDao.merge(message);
			return true;
		} else {
			return false;
		}
	}

	public Message getMessageById(int id) throws Exception {

		System.out.println("getMessageById");
		return messageDao.find(id);
	}

	public Collection<DTOMessageComplete> searchReceivedMessages(String email) throws Exception {

		// System.out.println("searchReceivedMessages - service");

		Collection<Message> receivedList = messageDao.getListReceivedMessages(email);
		Collection<DTOMessageComplete> receivedListDto = new ArrayList<DTOMessageComplete>();

		for (Message message : receivedList) {

			DTOMessageComplete messageDto = messageDao.convertEntityToDto(message);
			DTOUser senderDto = userDao.convertEntityToDto(message.getSender());

			messageDto.setSender(senderDto);

			receivedListDto.add(messageDto);
		}
		return receivedListDto;
	}

	public Collection<DTOMessageComplete> searchSentMessages(String email) throws Exception {

		System.out.println("searchReceivedMessages - service");
		Collection<Message> sentList = messageDao.getListSentMessages(email);
		Collection<DTOMessageComplete> sentListDto = new ArrayList<DTOMessageComplete>();

		for (Message message : sentList) {

			DTOMessageComplete messageDto = messageDao.convertEntityToDto(message);
			DTOUser receiverDto = userDao.convertEntityToDto(message.getReceiver());

			messageDto.setReceiver(receiverDto);
			sentListDto.add(messageDto);
		}
		return sentListDto;
	}

	public long getTotalUnreadMEssages(String email) throws Exception {
		return messageDao.getTotalMessagesUnread(email);

	}

	public boolean checkAuthorizationToView(User loggedUser, String idMessage) {

		Message message = messageDao.find(Integer.parseInt(idMessage));

		// O user enviou ou recebeu a mensagem e não é um visitante
		if (message.getReceiver().getEmail().equals(loggedUser.getEmail())
				|| message.getSender().getEmail().equals(loggedUser.getEmail())
						&& !loggedUser.getTypeUser().equals(UserType.VISITOR)) {
			return true;
		} else {
			return false;
		}

		// TODO Auto-generated method stub

	}

}
