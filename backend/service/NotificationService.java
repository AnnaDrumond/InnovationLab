package pt.uc.dei.projfinal.service;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;

import org.json.JSONObject;

import pt.uc.dei.projfinal.dao.DAOMember;
import pt.uc.dei.projfinal.dao.DAOMessage;
import pt.uc.dei.projfinal.dao.DAONotification;
import pt.uc.dei.projfinal.dao.DAOProject;
import pt.uc.dei.projfinal.dao.DAOUser;
import pt.uc.dei.projfinal.dto.DTONotification;
import pt.uc.dei.projfinal.entity.Member;
import pt.uc.dei.projfinal.entity.Member.MemberStatus;
import pt.uc.dei.projfinal.entity.Notification;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.Notification.NotificationType;

@RequestScoped
public class NotificationService implements Serializable {

	private static final long serialVersionUID = 1L;

	@Inject
	DAONotification notificationDao;
	@Inject
	DAOUser userDao;
	@Inject
	DAOProject projectDao;
	@Inject
	DAOMember memberDao;
	@Inject
	DAOMessage messageDao;

	public NotificationService() {

	}

	// método para criar uma nova notificação
	public void newNotification(String text, NotificationType type, User userOwner, int projectId,
			String userReferenced) throws Exception {
		Collection<Notification> notificationList = notificationDao.getUserNotification(userOwner.getEmail());
		Notification notification = new Notification();
		notification.setText(text);
		notification.setOwnerNot(userOwner);
		notification.setTypeNotification(type);
		notification.setSeen(false);
		notification.setIdProject(projectId);
		notification.setUserReferenced(userReferenced);
		notificationList.add(notification);
		userOwner.setUserNotificationList(notificationList);
		notificationDao.persist(notification);
		userDao.merge(userOwner);
	}

	// método para enviar notificações aos membros administradores do projeto
	public void sendNotificationToMembers(String text, NotificationType type, int projectId, String userReferenced)
			throws Exception {
		Collection<Member> projectMembers = projectDao.listProjectMembers(projectId);

		if (projectMembers.size() > 0) {
			for (Member member : projectMembers) {
				if (member.getMemberStatus().equals(MemberStatus.ADMINISTRATOR)) {
					newNotification(text, type, member.getUser(), projectId, userReferenced);
				}
			}
		}
	}

	// método para marcar a notificação como lida
	public void markAsSeen(int notificationId, User user) throws Exception {
		Notification notification = notificationDao.find(notificationId);
		if (notification.getOwnerNot().getEmail().equals(user.getEmail())) {
			if (notification.isSeen()) {
				notification.setSeen(false);
			} else {
				notification.setSeen(true);
			}
			notificationDao.merge(notification);
		}
	}

	// método para listar as notificações do utilizador
	public Collection<DTONotification> listNotifications(User user) throws Exception {

		Collection<Notification> notificationList = notificationDao.getUserNotification(user.getEmail());
		Collection<DTONotification> dtoList = new ArrayList<>();

		for (Notification notification : notificationList) {
			DTONotification dto = notificationDao.convertEntityToDto(notification);
			dtoList.add(dto);
		}
		return dtoList;
	}

	// método para eliminar as notificações do utilizador eliminado do projeto
	public void deleteNotificationsOfProjectParticipant(String email, int projectId) throws Exception {
		Collection<Notification> notificationList = notificationDao.getUserNotification(email);
		for (Notification notification : notificationList) {
			if (notification.getIdProject() == projectId) {
				notificationDao.remove(notification);
			}
		}
	}
	
	// método para eliminar as notificações do utilizador eliminado do projeto
		public void deleteNotificationsOfProjectDispomoted(String email, int projectId) throws Exception {
			Collection<Notification> notificationList = notificationDao.getUserNotification(email);
			for (Notification notification : notificationList) {
				if (notification.getTypeNotification().equals(NotificationType.REQUEST)
						&& notification.getIdProject() == projectId) {
					notificationDao.remove(notification);
				}
			}
		}

	public void deleteNotificationsOfOtherProjectAdmins(int projectId, String emailReferenced) throws Exception {
		Collection<Member> projectMembers = projectDao.listProjectMembers(projectId);
		for (Member member : projectMembers) {
			if (member.getMemberStatus().equals(MemberStatus.ADMINISTRATOR)) {
				Notification notification = notificationDao.getNotification(member.getUser().getEmail(),
						emailReferenced, projectId);
				if (notification != null) {
					notificationDao.remove(notification);
				}
			}
		}
	}

	// método para apagar todas as notificações relativas àquele projeto
	public void deleteAllNotificationsOfThatProject(int projectId) throws Exception {

		Collection<Notification> notifications = notificationDao.getNotificationsOfProject(projectId);

		for (Notification not : notifications) {
			notificationDao.remove(not);
		}

	}

	public boolean deleteNotificationById(int id) throws Exception {
		Notification notification = notificationDao.find(id);
		if (notification == null) {
			return false;
		}
		notificationDao.remove(notification);
		return true;

	}

	public JSONObject getMyNotificationsAndMessages(String email) throws Exception{
		JSONObject json = new JSONObject();
		
		long count = (int) notificationDao.getTotalNotificationsUnread(email);
		json.put("numNotifications", count);
		int numOfMessages = (int) messageDao.getTotalMessagesUnread(email);
		json.put("numberOfMessages", numOfMessages);
		return json;
	}

}
