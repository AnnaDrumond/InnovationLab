package pt.uc.dei.projfinal.service;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import pt.uc.dei.projfinal.dao.DAOForum;
import pt.uc.dei.projfinal.dao.DAOInterest;
import pt.uc.dei.projfinal.dao.DAOUser;
import pt.uc.dei.projfinal.dto.DTOForum;
import pt.uc.dei.projfinal.dto.DTOInterest;
import pt.uc.dei.projfinal.dto.DTOSkill;
import pt.uc.dei.projfinal.dto.DTOUser;
import pt.uc.dei.projfinal.entity.Forum;
import pt.uc.dei.projfinal.entity.Interest;
import pt.uc.dei.projfinal.entity.Skill;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.User.UserType;

@RequestScoped
public class InterestService implements Serializable {

	private static final long serialVersionUID = 1L;

	@Inject
	DAOInterest interestDao;
	@Inject
	DAOUser userDao;
	@Inject
	DAOForum forumDao;

	public InterestService() {

	}

	// método para criar um interesse
	public int createInterest(DTOInterest dtoInterest) throws Exception {

		// Verificar se a skill que veio no dto já existe na BD
		Interest interestAux = interestDao.getInterestByTitle(dtoInterest.getTitle());

		// Se existe retorna logo o id desta skill e nem mesmo cria outra skill
		if (interestAux != null) {
			return interestAux.getId();
		}

		Interest interest = interestDao.convertDtoToEntity(dtoInterest);
		interestDao.persist(interest);
		return interest.getId();
	}

	// método para associar um/vários interesse a um user
	public void associateInterestToUser(User user, String idsJson) throws Exception {

		// Separar os ids de interesses
		JsonArray jArrayInterest = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsInterest");
		List<Integer> idsInterestList = new ArrayList<Integer>();

		for (int i = 0; i < jArrayInterest.size(); i++) {
			idsInterestList.add(new Gson().fromJson(jArrayInterest.get(i), Integer.class));
		}

		// Associar cada interesse recebida àquele forum
		for (Integer interestId : idsInterestList) {

			Interest interest = interestDao.find(interestId);

			Collection<Interest> userInterests = userDao.getAssociatedInterests(user.getEmail(),
					"usersWhoHaveThisInterest");
			Collection<User> usersWhoHaveThisInterest = interestDao.getAssociatedUsers(interestId, "userInterestList");

			boolean exist = false;
			for (Interest interestAux : userInterests) {
				if (interestAux.getId() == interestId) {
					exist = true;
					break;
				}
			}
			if (!exist) {

				userInterests.add(interest);
				usersWhoHaveThisInterest.add(user);
				user.setUserInterestList(userInterests);
				interest.setUsersWhoHaveThisInterest(usersWhoHaveThisInterest);
				userDao.merge(user);
				interestDao.merge(interest);
			}
		}
	}

	// método para desassociar um/vários interesse de um user
	public void desassociateInterestFromUser(User user, String idsJson) throws Exception {

		// Separar os ids de interesses
		JsonArray jArrayInterest = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsInterest");
		List<Integer> idsInterestList = new ArrayList<Integer>();

		for (int i = 0; i < jArrayInterest.size(); i++) {
			idsInterestList.add(new Gson().fromJson(jArrayInterest.get(i), Integer.class));
		}

		// Associar cada interesse recebida àquele forum
		for (Integer interestId : idsInterestList) {

			Interest interest = interestDao.find(interestId);

			Collection<Interest> userInterests = userDao.getAssociatedInterests(user.getEmail(),
					"usersWhoHaveThisInterest");
			Collection<User> usersWhoHaveThisInterest = interestDao.getAssociatedUsers(interestId, "userInterestList");

			userInterests.removeIf(interestAux -> interestAux.getId() == interestId);
			usersWhoHaveThisInterest.removeIf(userAux -> userAux.getEmail().equals(user.getEmail()));

			user.setUserInterestList(userInterests);
			interest.setUsersWhoHaveThisInterest(usersWhoHaveThisInterest);

			userDao.merge(user);
			interestDao.merge(interest);
		}
	}

	// método para associar um interesse a uma ideia/necessidade
	public void associateInterestToForum(int forumId, String idsJson) throws Exception {

		// Separar os ids de interesses
		JsonArray jArrayInterest = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsInterest");
		List<Integer> idsInterestList = new ArrayList<Integer>();

		for (int i = 0; i < jArrayInterest.size(); i++) {
			idsInterestList.add(new Gson().fromJson(jArrayInterest.get(i), Integer.class));
		}

		Forum forum = forumDao.find(forumId);

		// Associar cada interesse recebida àquele forum
		for (Integer interestId : idsInterestList) {

			Interest interest = interestDao.find(interestId);

			Collection<Interest> interestList = forumDao.getInterestsAssociatedWithForum(forumId,
					"forumThatHaveThisInterest");
			Collection<Forum> forumsWithThisInterest = interestDao.getAssociatedForums(interestId,
					"interestsAssociatedWithForum");

			boolean exist = false;
			for (Interest interestAux : interestList) {
				if (interestAux.getId() == interestId) {
					exist = true;
					break;
				}
			}

			if (!exist) {

				interestList.add(interest);
				forumsWithThisInterest.add(forum);

				interest.setForumThatHaveThisInterest(forumsWithThisInterest);
				forum.setInterestsAssociatedWithForum(interestList);

				forumDao.merge(forum);
				interestDao.merge(interest);
			}

		}

	}

	// método para desassociar um interesse de uma ideia/necessidade
	public void desassociateInterestFromForum(int forumId, String idsJson) throws Exception {

		// Separar os ids de interesses
		JsonArray jArrayInterest = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsInterest");
		List<Integer> idsInterestList = new ArrayList<Integer>();

		for (int i = 0; i < jArrayInterest.size(); i++) {
			idsInterestList.add(new Gson().fromJson(jArrayInterest.get(i), Integer.class));
		}

		Forum forum = forumDao.find(forumId);

		// Desassociar cada interesse recebida àquele forum
		for (Integer interestId : idsInterestList) {

			Interest interest = interestDao.find(interestId);

			Collection<Interest> interestList = forumDao.getInterestsAssociatedWithForum(forumId,
					"forumThatHaveThisInterest");
			Collection<Forum> forumsWithThisInterest = interestDao.getAssociatedForums(interestId,
					"interestsAssociatedWithForum");

			interestList.removeIf(interestAux -> interestAux.getId() == interestId);
			forumsWithThisInterest.removeIf(forumAux -> forumAux.getId() == forumId);

			interest.setForumThatHaveThisInterest(forumsWithThisInterest);
			forum.setInterestsAssociatedWithForum(interestList);

			forumDao.merge(forum);
			interestDao.merge(interest);

		}

	}

	public Collection<DTOInterest> searchInterestsBySearchKey(String searchKey) throws Exception {

		Collection<Interest> interests = interestDao.searchInterestsBySearchKey(searchKey);
		Collection<DTOInterest> interestsDto = new ArrayList<DTOInterest>();

		for (Interest interest : interests) {
			DTOInterest interestDto = interestDao.convertEntityToDto(interest);
			interestsDto.add(interestDto);
		}
		return interestsDto;
	}

	public Collection<DTOInterest> getAllInterests() throws Exception {

		Collection<Interest> allInterests = interestDao.findAll();
		Collection<DTOInterest> allInterestsDto = new ArrayList<DTOInterest>();

		for (Interest interest : allInterests) {
			DTOInterest dto = interestDao.convertEntityToDto(interest);
			allInterestsDto.add(dto);
		}
		return allInterestsDto;
	}

	public Collection<DTOInterest> GetInterestsAssociatedWithUser(String email) {

		Collection<Interest> userInterests = userDao.getAssociatedInterests(email, "usersWhoHaveThisInterest");
		Collection<DTOInterest> allInterestsDto = new ArrayList<DTOInterest>();

		for (Interest interest : userInterests) {
			DTOInterest dto = interestDao.convertEntityToDto(interest);
			allInterestsDto.add(dto);
		}
		return allInterestsDto;

	}

	// Buscar interesse pelo titulo
	public DTOInterest getInterestByTitle(String title) throws Exception{
		Interest interest = interestDao.getInterestByTitle(title);
		return interestDao.convertEntityToDto(interest);
	}

	public boolean checkAuthorization(User user, Forum forum) throws Exception {

		if (user.getTypeUser().equals(UserType.ADMINISTRATOR) || user.getEmail().equals(forum.getOwner().getEmail())) {
			return true;
		}

		return false;

	}
	
	public boolean checkAuthEditUser(User loggedUser, User userToEdit) throws Exception {
		
		if(loggedUser.getEmail().equals(userToEdit.getEmail())) {
			return true;
		} 
		if(userToEdit.getTypeUser().equals(UserType.ADMINISTRATOR)) {
			return true;
		}
		return false;
	}

	public Collection<DTOInterest> GetInterestsAssociatedWithForum(int forumId) throws Exception {
		Collection<Interest> forumInterests = interestDao.getAssociatedInterestsForum(forumId);
		Collection<DTOInterest> allInterestsDto = new ArrayList<DTOInterest>();

		for (Interest interest : forumInterests) {
			DTOInterest dto = interestDao.convertEntityToDto(interest);
			allInterestsDto.add(dto);
		}
		return allInterestsDto;
	}
}
