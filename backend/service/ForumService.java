package pt.uc.dei.projfinal.service;

import java.io.Serializable;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import pt.uc.dei.projfinal.dao.DAOAssociation;
import pt.uc.dei.projfinal.dao.DAOForum;
import pt.uc.dei.projfinal.dao.DAOInterest;
import pt.uc.dei.projfinal.dao.DAOProject;
import pt.uc.dei.projfinal.dao.DAOSkill;
import pt.uc.dei.projfinal.dao.DAOUser;
import pt.uc.dei.projfinal.dto.DTOAssociation;
import pt.uc.dei.projfinal.dto.DTOForum;
import pt.uc.dei.projfinal.dto.DTOInterest;
import pt.uc.dei.projfinal.dto.DTOSkill;
import pt.uc.dei.projfinal.dto.DTOUser;
import pt.uc.dei.projfinal.entity.Association;
import pt.uc.dei.projfinal.entity.Forum;
import pt.uc.dei.projfinal.entity.Forum.ForumType;
import pt.uc.dei.projfinal.entity.Interest;
import pt.uc.dei.projfinal.entity.Project;
import pt.uc.dei.projfinal.entity.Skill;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.User.UserType;

@RequestScoped
public class ForumService implements Serializable {

	private static final long serialVersionUID = 1L;

	@Inject
	DAOForum forumDao;
	@Inject
	DAOUser userDao;
	@Inject
	DAOAssociation associationDao;
	@Inject
	DAOInterest interestDao;
	@Inject
	DAOSkill skillDao;
	@Inject
	DAOProject projectDao;

	public ForumService() {

	}

	// método para criar um novo forum
	public int createForum(DTOForum forumDto, User user) throws Exception {

		Forum forum = forumDao.convertDtoToEntity(forumDto);
		forum.setOwner(user);
		Timestamp now = new Timestamp(System.currentTimeMillis());
		forum.setLastUpdate(now);

		forumDao.persist(forum);
		// devolver pelo body da requisição o id da ideia/necessidade recém-criada
		return forum.getId();
	}

	// método para favoritar o forum
	public void addForumToUserFavorites(User user, int forumId) throws Exception {
		Forum forum = forumDao.find(forumId);

		Collection<Forum> userFavoritedForums = userDao.getAssociatedForum(user.getEmail(), "usersWhoFavorited");
		Collection<User> usersWhoLikedForum = forumDao.getUsersAssociatedWithForum(forumId, "favoritedForums");

		boolean exist = false;
		for (Forum forumAux : userFavoritedForums) {
			if (forumAux.getId() == forumId) {
				exist = true;
				break;
			}
		}
		// falta prevenir que não adiciona repetido!

		if (!exist) {

			userFavoritedForums.add(forum);
			usersWhoLikedForum.add(user);

			user.setFavoritedForums(userFavoritedForums);
			forum.setUsersWhoFavorited(usersWhoLikedForum);

			userDao.merge(user);
			forumDao.merge(forum);
		}
	}

	// método para remover o forum dos favoritos
	public void removeForumToUserFavorites(User user, int forumId) {
		Forum forum = forumDao.find(forumId);

		Collection<Forum> userFavoritedForums = userDao.getAssociatedForum(user.getEmail(), "usersWhoFavorited");
		Collection<User> usersWhoLikedForum = forumDao.getUsersAssociatedWithForum(forumId, "favoritedForums");

		userFavoritedForums.removeIf(forumAux -> forumAux.getId() == forumId);
		usersWhoLikedForum.removeIf(userAux -> userAux.getEmail().equals(user.getEmail()));

		user.setFavoritedForums(userFavoritedForums);
		forum.setUsersWhoFavorited(usersWhoLikedForum);

		userDao.merge(user);
		forumDao.merge(forum);

	}

	// método para votar num projeto
	public void voteInForum(User user, int forumId) throws Exception {
		Forum forum = forumDao.find(forumId);

		Collection<Forum> userVotedForums = userDao.getAssociatedForum(user.getEmail(), "usersWhoHaveVoted");
		Collection<User> usersWhoVotedForum = forumDao.getUsersAssociatedWithForum(forumId, "forumsUserHasVotedIn");

		boolean exist = false;
		for (Forum forumAux : userVotedForums) {
			if (forumAux.getId() == forumId) {
				exist = true;
				break;
			}
		}
		// falta prevenir que não adiciona repetido!

		if (!exist) {

			userVotedForums.add(forum);
			usersWhoVotedForum.add(user);

			user.setForumsUserHasVotedIn(userVotedForums);
			forum.setUsersWhoHaveVoted(usersWhoVotedForum);

			userDao.merge(user);
			forumDao.merge(forum);
		}
	}

	// método para remover o voto
	public void removevoteInForum(User user, int forumId) throws Exception {

		Forum forum = forumDao.find(forumId);

		Collection<Forum> userVotedForums = userDao.getAssociatedForum(user.getEmail(), "usersWhoHaveVoted");
		Collection<User> usersWhoVotedForum = forumDao.getUsersAssociatedWithForum(forumId, "forumsUserHasVotedIn");

		userVotedForums.removeIf(forumAux -> forumAux.getId() == forumId);
		usersWhoVotedForum.removeIf(userAux -> userAux.getEmail().equals(user.getEmail()));

		// userWishesToWorkInForums.add(forum);
		// usersWhoWishToWorkInForum.add(user);

		user.setForumsUserHasVotedIn(userVotedForums);
		forum.setUsersWhoHaveVoted(usersWhoVotedForum);

		userDao.merge(user);
		forumDao.merge(forum);
	}

	public void showInterestInWorking(User user, int forumId) throws Exception {
		Forum forum = forumDao.find(forumId);

		Collection<Forum> userWishesToWorkInForums = userDao.getAssociatedForum(user.getEmail(),
				"usersWhoHaveInterest");
		Collection<User> usersWhoWishToWorkInForum = forumDao.getUsersAssociatedWithForum(forumId,
				"forumsUserWishesToWorkIn");

		boolean exist = false;
		for (Forum forumAux : userWishesToWorkInForums) {
			if (forumAux.getId() == forumId) {
				exist = true;
				break;
			}
		}
		// falta prevenir que não adiciona repetido!

		if (!exist) {

			userWishesToWorkInForums.add(forum);
			usersWhoWishToWorkInForum.add(user);

			user.setForumsUserWishesToWorkIn(userWishesToWorkInForums);
			forum.setUsersWhoHaveInterest(usersWhoWishToWorkInForum);

			userDao.merge(user);
			forumDao.merge(forum);
		}
	}

	public void removeInterestInWorking(User user, int forumId) throws Exception {
		Forum forum = forumDao.find(forumId);

		Collection<Forum> userWishesToWorkInForums = userDao.getAssociatedForum(user.getEmail(),
				"usersWhoHaveInterest");
		Collection<User> usersWhoWishToWorkInForum = forumDao.getUsersAssociatedWithForum(forumId,
				"forumsUserWishesToWorkIn");

		userWishesToWorkInForums.removeIf(forumAux -> forumAux.getId() == forumId);
		usersWhoWishToWorkInForum.removeIf(userAux -> userAux.getEmail().equals(user.getEmail()));

		// userWishesToWorkInForums.add(forum);
		// usersWhoWishToWorkInForum.add(user);

		user.setForumsUserWishesToWorkIn(userWishesToWorkInForums);
		forum.setUsersWhoHaveInterest(usersWhoWishToWorkInForum);

		userDao.merge(user);
		forumDao.merge(forum);

	}

	// método para associar um forum(ideia/necessidade) a outro
	public void associateForums(int firstId, int secondId, DTOAssociation dto) throws Exception {

		System.out.println("associateForums - service");

		Forum originalForum = forumDao.find(firstId);
		Forum forumToAssociate = forumDao.find(secondId);

		if (originalForum != null && forumToAssociate != null) {

			Collection<Association> associatedForums = forumDao.getAssociatedForums(firstId, "associatedForum");
			Collection<Association> forumsToAssociate = forumDao.getAssociatedForums(firstId, "forumToAssociate");

			Collection<Association> associatedForumsForum2 = forumDao.getAssociatedForums(secondId, "associatedForum");
			Collection<Association> forumsToAssociateForum2 = forumDao.getAssociatedForums(secondId,
					"forumToAssociate");

			// System.out.println(associatedForums.size());
			// lista de forums que vou associar ao forum atual
			boolean exist = false;
			for (Association association : associatedForums) {
				if (association.getForumToAssociate().getId() == secondId
						|| association.getForumToAssociate().getId() == firstId) {
					exist = true;
					break;
				}
			}

			if (!exist) {
				for (Association association : forumsToAssociate) {
					if (association.getForumToAssociate().getId() == firstId
							|| association.getForumToAssociate().getId() == secondId) {
						exist = true;
						break;
					}
				}
			}

			if (!exist) {

				Association association = null;

				if (dto.getDescription() != "") {
					System.out.println("if");
					association = associationDao.convertDtoToEntity(dto);

				} else {
					System.out.println("else");
					association = new Association();
				}

				association.setForumToAssociate(forumToAssociate);
				association.setAssociatedForum(originalForum);

				associatedForums.add(association);
				associatedForumsForum2.add(association);

				originalForum.setForumAssociated(associatedForums);
				forumToAssociate.setForumAssociated(associatedForumsForum2);

				forumsToAssociate.add(association);
				forumsToAssociateForum2.add(association);

				originalForum.setForumToAssociate(forumsToAssociate);
				forumToAssociate.setForumToAssociate(forumsToAssociateForum2);

				System.out.println("antes do persist de association");
				associationDao.persist(association);
				forumDao.merge(originalForum);
				forumDao.merge(forumToAssociate);
			}
		}

	}

	// método para desassociar ideia/necessidade de ideia/necessidade
	public boolean desassociateForums(int id, User loggedUser) throws Exception {

		System.out.println("desassociateForums service com o id " + id);
		Association association = associationDao.find(id);
		System.out.println("achei a associação " + association);

		if (association == null) {
			return false;
		}

		Forum forum1 = forumDao.find(association.getAssociatedForum().getId());
		Forum forum2 = forumDao.find(association.getForumToAssociate().getId());

		System.out.println("forum1 " + id + forum1.getTitle());
		System.out.println("forum2 " + id + forum2.getTitle());

		if (forum1.getOwner().getEmail().equals(loggedUser.getEmail())
				|| forum2.getOwner().getEmail().equals(loggedUser.getEmail())
				|| loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {
			//
			Collection<Association> associatedForums = forumDao
					.getAssociatedForums(association.getAssociatedForum().getId(), "associatedForum");
			Collection<Association> forumsToAssociate = forumDao
					.getAssociatedForums(association.getAssociatedForum().getId(), "forumToAssociate");
			Collection<Association> associatedForums2 = forumDao
					.getAssociatedForums(association.getForumToAssociate().getId(), "associatedForum");
			Collection<Association> forumsToAssociate2 = forumDao
					.getAssociatedForums(association.getForumToAssociate().getId(), "forumToAssociate");
			// System.out.println(associatedForums.size());

			associatedForums.removeIf(associationAux -> associationAux.getId() == id);
			// System.out.println(associatedForums.size());
			forumsToAssociate.removeIf(associationAux -> associationAux.getId() == id);

			associatedForums2.removeIf(associationAux -> associationAux.getId() == id);
			forumsToAssociate2.removeIf(associationAux -> associationAux.getId() == id);

			forum1.setForumAssociated(associatedForums);
			forum1.setForumToAssociate(forumsToAssociate);
			forum2.setForumAssociated(associatedForums2);
			forum2.setForumToAssociate(forumsToAssociate2);
			forumDao.merge(forum1);
			forumDao.merge(forum2);

			associationDao.remove(association);
			return true;
		}

		return false;

	}

	// método para poder editar a ideia/necessidade
	public void editForum(DTOForum dto, Forum forum) throws Exception {
		Forum forumEdited = forumDao.convertDtoToEntity(forum, dto);
		Timestamp now = new Timestamp(System.currentTimeMillis());
		forum.setLastUpdate(now);
		forumDao.merge(forumEdited);
	}

	// método para obter o Forum através do id
	public Forum findForum(int id) throws Exception {
		return forumDao.find(id);
	}

	// método para obter a lista de forums que o usr favoritou
	public Collection<DTOForum> listFavoriteForum(User user) throws Exception {

		Collection<Forum> userFavoritedForums = userDao.getAssociatedForum(user.getEmail(), "usersWhoFavorited");
		Collection<DTOForum> userFavoriteDto = new ArrayList<>();

		for (Forum forum : userFavoritedForums) {
			DTOForum dto = forumDao.convertEntityToDto(forum);
			DTOUser userDto = userDao.convertEntityToDto(forum.getOwner());
			dto.setUserOwner(userDto);
			// Buscar quantidade de users(votos) que votaram nesta ideia
			int totalVotes = (int) forumDao.searchTotalVotes(forum.getId());

			// Adicionar o Forum a sua quantidade de votos
			dto.setTotalVotes(totalVotes);

			userFavoriteDto.add(dto);
		}
		return userFavoriteDto;
	}

	// método para editar o texto da associação entre foruns
	public boolean editAssociation(int id, DTOAssociation dto, String email) throws Exception {
		Association associationAux = associationDao.find(id);
		if (associationAux.getAssociatedForum().getOwner().getEmail().equals(email)) {
			Association association = associationDao.convertDtoToEntity(associationAux, dto);

			associationDao.merge(association);
			return true;
		}
		return false;
	}

	// método para listar os forums que o user registou
	public Collection<DTOForum> listRegisteredForum(User user) throws Exception {
		
		Collection<Forum> listRegistered = forumDao.listRegisteredForum(user.getEmail());
		Collection<DTOForum> listDto = new ArrayList<>();

		for (Forum forum : listRegistered) {
			DTOForum dto = forumDao.convertEntityToDto(forum);
			DTOUser userDto = userDao.convertEntityToDto(forum.getOwner());
			// Buscar quantidade de users(votos) que votaram nesta ideia
			int totalVotes = (int) forumDao.searchTotalVotes(forum.getId());

			// Adicionar o Forum a sua quantidade de votos
			dto.setTotalVotes(totalVotes);
			dto.setUserOwner(userDto);

			listDto.add(dto);
		}

		return listDto;
	}

	// método para listar as associações que existe com aquele forum
	public Collection<DTOAssociation> getAssociationList(int idForum) throws Exception {

		Collection<Association> associationList = associationDao.getList(idForum, "associatedForum");
		Collection<DTOAssociation> dtoList = new ArrayList<>();

		for (Association association : associationList) {

			if (!association.getAssociatedForum().isSoftDelete() && !association.getForumToAssociate().isSoftDelete()) {

				DTOAssociation dto = associationDao.convertEntityToDto(association);
				// dto.setDescription(association.getDescription());
				DTOForum dtoForum = new DTOForum();
				DTOUser userDto = new DTOUser();

				if (association.getAssociatedForum().getId() == idForum) {
					dtoForum = forumDao.convertEntityToDto(association.getForumToAssociate());
					userDto = userDao.convertEntityToDto(association.getForumToAssociate().getOwner());
				} else {
					dtoForum = forumDao.convertEntityToDto(association.getAssociatedForum());
					userDto = userDao.convertEntityToDto(association.getAssociatedForum().getOwner());
				}

				dtoForum.setUserOwner(userDto);
				// Buscar quantidade de users(votos) que votaram nesta ideia
				int totalVotes = (int) forumDao.searchTotalVotes(idForum);
				// Adicionar o Forum a sua quantidade de votos
				dtoForum.setTotalVotes(totalVotes);
				dto.setAssociatedForum(dtoForum);
				dtoList.add(dto);
			}
		}
		return dtoList;
	}

	// método para obter todos os forums
	public Collection<DTOForum> getAllSystemForums() throws Exception {

		Collection<Forum> allSystemForums = forumDao.listNonDeletedForum();
		// System.out.println("voltei da BD com o total de forums " +
		// allSystemForums.size());

		Collection<DTOForum> allForumsDto = new ArrayList<DTOForum>();

		for (Forum forum : allSystemForums) {
			DTOForum forumDto = forumDao.convertEntityToDto(forum);

			DTOUser userDto = userDao.convertEntityToDto(forum.getOwner());
			forumDto.setUserOwner(userDto);

			// Buscar quantidade de users(votos) que votaram neste forum
			int totalVotes = (int) forumDao.searchTotalVotes(forum.getId());
			// Adicionar o Forum a sua quantidade de votos
			forumDto.setTotalVotes(totalVotes);

			allForumsDto.add(forumDto);
		}
		return allForumsDto;

	}

	// método para obter as ideias
	public Collection<DTOForum> getForumByType(ForumType type) throws Exception {

		Collection<Forum> allIdeas = forumDao.getForumsByidea(type);
		Collection<DTOForum> allDto = new ArrayList<DTOForum>();

		for (Forum forum : allIdeas) {

			DTOForum forumDto = forumDao.convertEntityToDto(forum);
			DTOUser userDto = userDao.convertEntityToDto(forum.getOwner());
			forumDto.setUserOwner(userDto);

			// Buscar quantidade de users(votos) que votaram nesta ideia
			int totalVotes = (int) forumDao.searchTotalVotes(forum.getId());

			// Adicionar o Forum a sua quantidade de votos
			forumDto.setTotalVotes(totalVotes);

			allDto.add(forumDto);
		}
		return allDto;
	}

	// método para obter o forum através do seu id
	public DTOForum getForumById(int idForum, User loggedUser) throws Exception {

		Forum forum = forumDao.find(idForum);

		if (forum.isSoftDelete()) {
			return null;
		}

		DTOForum dto = forumDao.convertEntityToDto(forum);
		// Para no front termos a informação se este Forum foi favoritado pelo user:
		// obter lista de forums que este user favoritou
		Collection<Forum> favorites = userDao.getAssociatedForum(loggedUser.getEmail(), "usersWhoFavorited");
		for (Forum favorite : favorites) {
			if (favorite.getId() == forum.getId()) {
				dto.setFavorited(true);
			}
		}

		// Para no front termos a informação se este Forum foi votado pelo user:
		Collection<Forum> votedList = forumDao.getForumsThatUserVoted(loggedUser.getEmail());
		for (Forum voted : votedList) {
			if (voted.getId() == forum.getId()) {
				dto.setVoted(true);
			}
		}

		DTOUser userDto = userDao.convertEntityToDto(forum.getOwner());
		dto.setUserOwner(userDto);
		// Buscar quantidade de users(votos) que votaram neste forum
		int totalVotes = (int) forumDao.searchTotalVotes(idForum);
		dto.setTotalVotes(totalVotes);

		// Buscar a quantidade de comentários do Forum
		int totalComments = (int) forumDao.searchTotalComments(idForum);
		dto.setTotalComments(totalComments);
		return dto;
	}

	// método para obter a lista de users que têm interesse em trabalhar neste forum
	public Collection<DTOUser> getUsersWhoHaveInterest(int idForum) throws Exception {

		System.out.println("SERVIce ");

		Collection<User> users = forumDao.getUsersWhoHaveInterest(idForum);

		Collection<DTOUser> dtos = new ArrayList<DTOUser>();

		for (User user : users) {
			DTOUser dto = new DTOUser();
			dto = userDao.convertEntityToDto(user);
			dtos.add(dto);
		}

		return dtos;
	}

	// método para obter a lista de forums favoritos do user
	public Collection<DTOForum> filterByUserFavorite(String email, ForumType type) throws Exception {

		Collection<Forum> forums = userDao.filterByUserFavoriteIdeas(email, type);
		// Ao final transformar a resposta para Dto
		Collection<DTOForum> dtosList = new ArrayList<DTOForum>();
		for (Forum forum : forums) {
			DTOForum dto = forumDao.convertEntityToDto(forum);
			DTOUser userDto = userDao.convertEntityToDto(forum.getOwner());
			dto.setUserOwner(userDto);
			// Buscar quantidade de users(votos) que votaram neste forum
			int totalVotes = (int) forumDao.searchTotalVotes(forum.getId());
			dto.setTotalVotes(totalVotes);
			dtosList.add(dto);
		}

		return dtosList;
	}

	// método para obter a lista de necessidades ou ideias registadas pelo
	// utilizador
	public Collection<DTOForum> filterByUserRegistered(String email, ForumType type) throws Exception {
		Collection<Forum> forums = forumDao.listRegisteredIdeasOrNecessities(email, type);
		// Ao final transformar a resposta para Dto
		Collection<DTOForum> dtosList = new ArrayList<DTOForum>();
		for (Forum forum : forums) {
			DTOForum dto = forumDao.convertEntityToDto(forum);
			DTOUser userDto = userDao.convertEntityToDto(forum.getOwner());
			dto.setUserOwner(userDto);
			// Buscar quantidade de users(votos) que votaram neste forum
			int totalVotes = (int) forumDao.searchTotalVotes(forum.getId());
			dto.setTotalVotes(totalVotes);
			dtosList.add(dto);
		}

		return dtosList;
	}

	// busca ativa dos interesses associados aos forums registados por aquele user
	public List<DTOInterest> searchInterestsByForumUser(String email, String searchkey, String typeForum)
			throws Exception {

		ForumType type;

		// obter o tipo: ou ideia ou necessidade
		switch (typeForum) {
		case "necessity":
			type = ForumType.NECESSITY;
			break;
		case "idea":
			type = ForumType.IDEA;
			break;
		default:
			return null;
		}
		//
		System.out.println("entrei no service com o email " + email);
		List<DTOInterest> listDto = new ArrayList<DTOInterest>();
		List<Interest> interests = forumDao.searchInterestsByForumUser(email, searchkey, type);
		// System.out.println(interests);
		for (Interest interest : interests) {
			DTOInterest dto = interestDao.convertEntityToDto(interest);
			listDto.add(dto);
		}
		return listDto;
	}

	// busca ativa das skills associadas aos forums registados por aquele user
	public List<DTOSkill> searchSkillsByForumUser(String email, String searchkey, String typeForum) throws Exception {

		ForumType type;

		// obter o tipo: ou ideia ou necessidade
		switch (typeForum) {
		case "necessity":
			type = ForumType.NECESSITY;
			break;
		case "idea":
			type = ForumType.IDEA;
			break;
		default:
			return null;
		}

		System.out.println("entrei no service com o email " + email);
		List<DTOSkill> listDto = new ArrayList<DTOSkill>();
		List<Skill> skills = forumDao.searchSkillsByForumUser(email, searchkey, type);
		System.out.println(skills);

		for (Skill skill : skills) {
			DTOSkill dto = skillDao.convertEntityToDto(skill);
			listDto.add(dto);
		}
		return listDto;
	}

	// Buscar o Forum mais recente que um determinaod user criou
	public DTOForum getLatestForumUser(String email) {
		Forum forum = forumDao.getLatestForumUser(email);
		DTOForum dto = forumDao.convertEntityToDto(forum);
		DTOUser userDto = userDao.convertEntityToDto(forum.getOwner());
		dto.setUserOwner(userDto);
		return dto;
	}

	// Verificar se user é admin do sistema ou se user é owner/escreveu o comentário
	public boolean checkAuthorization(User loggedUser, Forum forum) throws Exception {

		// verificar se o user logado é um admin ou owner do forum
		if (loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)
				|| forum.getOwner().getEmail().equals(loggedUser.getEmail())
				|| loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {
			return true;

		} else {
			return false;
		}

	}

	public boolean deleteForum(Forum forum) throws Exception {

		Collection<Project> projectsAssociated = forumDao.listProjectsAssociatedWithForum(forum.getId());

		for (Project project : projectsAssociated) {
			//
			int size = projectDao.getForumsAssociatedWithProject(project.getId()).size();
			if (size == 1) {
				return false;// se é o unico forum associado a um projeto, já para e devolve false
			}
		}

		// Se passou, é porque não é o unico forum associado a um projeto ativo
		forum.setSoftDelete(true);
		forumDao.merge(forum);
		return true;
	}

	// Filtrar forums por skills e ou interesses -
	public List<DTOForum> filterBySkillsAndOrInterests(String idsJson, String categoryToSearch) {

		System.out.println("service " + idsJson);

		// Separar os ids de Skills
		JsonArray jArraySkill = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsSkills");
		List<Integer> idsSkillsList = new ArrayList<Integer>();

		for (int i = 0; i < jArraySkill.size(); i++) {
			System.out.println("for");
			idsSkillsList.add(new Gson().fromJson(jArraySkill.get(i), Integer.class));
		}

		System.out.println("lista de ids de skills: ");
		System.out.println(idsSkillsList);

		// Separar os ids de Interesses
		JsonArray jArrayInterest = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsInterest");
		List<Integer> idsInterestList = new ArrayList<Integer>();

		for (int i = 0; i < jArrayInterest.size(); i++) {
			idsInterestList.add(new Gson().fromJson(jArrayInterest.get(i), Integer.class));
		}

		System.out.println("lista de ids de interesses: ");
		System.out.println(idsInterestList);

		// Auxiliares
		int skillsSize = idsSkillsList.size();
		int interestsSize = idsInterestList.size();
		List<Forum> forumsFoundBD = null;
		List<Forum> forumsFinalList = new ArrayList<Forum>();

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// filtrar por um interesse e várias skills
		if (interestsSize == 1 && skillsSize > 1) {
			forumsFoundBD = forumDao.getUsersBySkillsAndSingleInterests(idsSkillsList, idsInterestList.get(0));
			System.out.println("voltei do dao 1 com a lista " + forumsFoundBD);

			// Gerar a lista final
			forumsFinalList = generatorForumsFinalList(forumsFoundBD, skillsSize);
			// System.out.println("voltei de generatorForumsFinalList " + forumsFinalList);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// filtrar por uma skill e vários interesses
		} else if (interestsSize > 1 && skillsSize == 1) {

			forumsFoundBD = forumDao.getUsersBySingleSkillsAndInterests(idsSkillsList.get(0), idsInterestList);
			// System.out.println("voltei do dao 2 com a lista " + forumsFoundBD);

			// Gerar a lista final
			forumsFinalList = generatorForumsFinalList(forumsFoundBD, interestsSize);
			// System.out.println("voltei de generatorForumsFinalList " + forumsFinalList);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// filtrar por várias skills e vários interesses
		} else if (interestsSize > 1 && skillsSize > 1) {

			forumsFoundBD = forumDao.getUsersByManySkillsAndInterests(idsSkillsList, idsInterestList);
			// System.out.println("voltei do dao 3 com a lista " + forumsFoundBD);

			// Gerar a lista final
			forumsFinalList = generatorForumsFinalList(forumsFoundBD, interestsSize + skillsSize);
			// System.out.println("voltei de generatorForumsFinalList " + forumsFinalList);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// filtrar somente por várias skills
		} else if (interestsSize == 0 && skillsSize > 1) {

			forumsFoundBD = forumDao.getUsersByManySkills(idsSkillsList);
			System.out.println("voltei do dao 4 com a lista " + forumsFoundBD);

			// Gerar a lista final
			forumsFinalList = generatorForumsFinalList(forumsFoundBD, skillsSize);
			System.out.println("voltei de generatorForumsFinalList " + forumsFinalList);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// filtrar somente por vários interesses
		} else if (interestsSize > 1 && skillsSize == 0) {

			forumsFoundBD = forumDao.getUsersByManyInterests(idsInterestList);
			System.out.println("voltei do dao 4 com a lista " + forumsFoundBD);

			// Gerar a lista final
			forumsFinalList = generatorForumsFinalList(forumsFoundBD, interestsSize);
			System.out.println("voltei de generatorForumsFinalList " + forumsFinalList);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// filtrar somente por UMA skill
		} else if (interestsSize == 0 && skillsSize == 1) {

			forumsFoundBD = forumDao.filterForumBySkillId(idsSkillsList.get(0));
			forumsFinalList.addAll(forumsFoundBD);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// filtrar somente por UM interesse
		} else if (interestsSize == 1 && skillsSize == 0) {

			forumsFoundBD = forumDao.filterForumByInterestId(idsInterestList.get(0));
			forumsFinalList.addAll(forumsFoundBD);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// filtrar somente por UM interesse e UMA skill
		} else if (interestsSize == 1 && skillsSize == 1) {

			forumsFoundBD = forumDao.filterForumBySkillIdAndInterestId(idsSkillsList.get(0), idsInterestList.get(0));
			forumsFinalList.addAll(forumsFoundBD);

		}

		// se a pesquisa for somente por ideias, remover as necessidades
		if (categoryToSearch.equals("IDEA")) {
			forumsFinalList.removeIf(forum -> forum.getForumType().equals(ForumType.NECESSITY));
		}

		// se apesquisa for somente por necessidades, remover as ideias
		if (categoryToSearch.equals("NECESSITY")) {
			forumsFinalList.removeIf(forum -> forum.getForumType().equals(ForumType.IDEA));
		}

		// SE FOR ALL SÓ AVANÇA
		System.out.println("sai dos ifs com a lista " + forumsFinalList);

		// Ao final transformar a resposta para Dto
		List<DTOForum> dtosList = new ArrayList<DTOForum>();

		for (Forum forum : forumsFinalList) {
			System.out.println("for dto forum" + forum);
			DTOForum dto = forumDao.convertEntityToDto(forum);
			System.out.println("voltei de converter forum para dto");
			DTOUser userDto = userDao.convertEntityToDto(forum.getOwner());
			dto.setUserOwner(userDto);
			// Buscar quantidade de users(votos) que votaram neste forum
			int totalVotes = (int) forumDao.searchTotalVotes(forum.getId());
			dto.setTotalVotes(totalVotes);
			dtosList.add(dto);
		}

		System.out.println(" lista de dto " + dtosList);
		return dtosList;

	}

	// METODO AUXILIAR garante que todos os Forums tenham os critérios escolhidos
	public List<Forum> generatorForumsFinalList(List<Forum> forumsFoundBD, int sizeIdsList) {

		System.out.println("generatorForumsFinalList sizeIdsList" + sizeIdsList);

		List<Forum> forumsFinalList = new ArrayList<Forum>();

		int counter = 1;
		// ver quem aparece a mesma qtde de vezes do que a quantidade de ids que
		// estou buscando, pois este forum teria tudo da busca

		for (int i = 0; i < forumsFoundBD.size(); i++) {

			for (int j = i + 1; j < forumsFoundBD.size(); j++) {
				// System.out.println("size 2 for " + usersToAdd.size());
				// System.out.print(" i: " + i + " - J: " + j);
				if (forumsFoundBD.get(i).getId() == forumsFoundBD.get(j).getId()) {
					counter++;
				}
				// System.out.println();
			} // fim for j

			// System.out.println("emailsCounter " + emailsCounter);

			if (counter == sizeIdsList) {
				// System.out.println("emailsCounter == sizeIdsList");
				// System.out.println(forumsFoundBD.get(i));
				forumsFinalList.add(forumsFoundBD.get(i));
			}
			counter = 1;
		} // fim for i

		return forumsFinalList;
	}

	public Collection<DTOForum> filterRegisteredBySkillsAndOrInterests(String user, String idsJson,
			String categoryToSearch) throws Exception {

		System.out.println("service " + idsJson);

		// Separar os ids de Skills
		JsonArray jArraySkill = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsSkills");
		List<Integer> idsSkillsList = new ArrayList<Integer>();

		for (int i = 0; i < jArraySkill.size(); i++) {
			System.out.println("for");
			idsSkillsList.add(new Gson().fromJson(jArraySkill.get(i), Integer.class));
		}

		System.out.println(idsSkillsList);

		// Separar os ids de Interesses
		JsonArray jArrayInterest = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsInterest");
		List<Integer> idsInterestList = new ArrayList<Integer>();

		for (int i = 0; i < jArrayInterest.size(); i++) {
			idsInterestList.add(new Gson().fromJson(jArrayInterest.get(i), Integer.class));
		}

		System.out.println(idsInterestList);

		ForumType type;

		// obter o tipo: ou ideia ou necessidade
		switch (categoryToSearch) {
		case "necessity":
			type = ForumType.NECESSITY;
			break;
		case "idea":
			type = ForumType.IDEA;
			break;
		default:
			return null;
		}

		// Auxiliares
		int skillsSize = idsSkillsList.size();
		int interestsSize = idsInterestList.size();
		List<Forum> forumsFoundBD = null;
		List<Forum> forumsFinalList = new ArrayList<Forum>();

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// filtrar por um interesse e várias skills
		if (interestsSize == 1 && skillsSize > 1) {
			forumsFoundBD = forumDao.getUsersRegisteredForumsBySkillsAndSingleInterests(idsSkillsList,
					idsInterestList.get(0), user, type);
			// System.out.println("voltei do dao 1 com a lista " + forumsFoundBD);

			// Gerar a lista final
			forumsFinalList = generatorForumsFinalList(forumsFoundBD, skillsSize);
			// System.out.println("voltei de generatorForumsFinalList " + forumsFinalList);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// filtrar por uma skill e vários interesses
		} else if (interestsSize > 1 && skillsSize == 1) {

			forumsFoundBD = forumDao.getUsersRegisteredForumsBySingleSkillsAndInterests(idsSkillsList.get(0),
					idsInterestList, user, type);
			// System.out.println("voltei do dao 2 com a lista " + forumsFoundBD);

			// Gerar a lista final
			forumsFinalList = generatorForumsFinalList(forumsFoundBD, interestsSize);
			// System.out.println("voltei de generatorForumsFinalList " + forumsFinalList);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// filtrar por várias skills e vários interesses
		} else if (interestsSize > 1 && skillsSize > 1) {

			forumsFoundBD = forumDao.getUsersRegisteredForumsByManySkillsAndInterests(idsSkillsList, idsInterestList,
					user, type);
			// System.out.println("voltei do dao 3 com a lista " + forumsFoundBD);

			// Gerar a lista final
			forumsFinalList = generatorForumsFinalList(forumsFoundBD, interestsSize + skillsSize);
			// System.out.println("voltei de generatorForumsFinalList " + forumsFinalList);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// filtrar somente por várias skills
		} else if (interestsSize == 0 && skillsSize > 1) {

			forumsFoundBD = forumDao.getUsersRegisteredForumsByManySkills(idsSkillsList, user, type);
			System.out.println("voltei do dao 4 com a lista " + forumsFoundBD);

			// Gerar a lista final
			forumsFinalList = generatorForumsFinalList(forumsFoundBD, skillsSize);
			System.out.println("voltei de generatorForumsFinalList " + forumsFinalList);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// filtrar somente por vários interesses
		} else if (interestsSize > 1 && skillsSize == 0) {

			forumsFoundBD = forumDao.getUsersRegisteredForumsByManyInterests(idsInterestList, user, type);
			System.out.println("voltei do dao 4 com a lista " + forumsFoundBD);

			// Gerar a lista final
			forumsFinalList = generatorForumsFinalList(forumsFoundBD, interestsSize);
			System.out.println("voltei de generatorForumsFinalList " + forumsFinalList);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// filtrar somente por UMA skill
		} else if (interestsSize == 0 && skillsSize == 1) {

			forumsFoundBD = forumDao.filterUsersRegisteredForumBySkillId(idsSkillsList.get(0), user, type);
			forumsFinalList.addAll(forumsFoundBD);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// filtrar somente por UM interesse
		} else if (interestsSize == 1 && skillsSize == 0) {

			forumsFoundBD = forumDao.filterUsersRegisteredForumByInterestId(idsInterestList.get(0), user, type);
			forumsFinalList.addAll(forumsFoundBD);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// filtrar somente por UM interesse e UMA skill
		} else if (interestsSize == 1 && skillsSize == 1) {

			forumsFoundBD = forumDao.filterUsersRegisteredForumBySkillIdAndInterestId(idsSkillsList.get(0),
					idsInterestList.get(0), user, type);
			forumsFinalList.addAll(forumsFoundBD);

		}

		// Ao final transformar a resposta para Dto
		List<DTOForum> dtosList = new ArrayList<DTOForum>();

		for (Forum forum : forumsFinalList) {
			System.out.println("for dto forum" + forum);
			DTOForum dto = forumDao.convertEntityToDto(forum);
			System.out.println("voltei de converter forum para dto");
			DTOUser userDto = userDao.convertEntityToDto(forum.getOwner());
			dto.setUserOwner(userDto);
			// Buscar quantidade de users(votos) que votaram neste forum
			int totalVotes = (int) forumDao.searchTotalVotes(forum.getId());
			dto.setTotalVotes(totalVotes);
			dtosList.add(dto);
		}

		System.out.println(" lista de dto " + dtosList);
		return dtosList;
	}

	public Collection<DTOForum> searchForumBySearchKey(String searchKey, String type) {
		ForumType typeForum = null;
		// System.out.println(type + " AAAAAAAAAAAAAAAAAAA");
		if (type.equals("necessity")) {
			typeForum = ForumType.NECESSITY;
		} else if (type.equals("idea")) {
			typeForum = ForumType.IDEA;
		}

		System.out.println(typeForum);

		List<Forum> forumList = forumDao.getForumBySearchKey(searchKey, typeForum);
		List<DTOForum> dtoList = new ArrayList<>();

		System.out.println(forumList.size());
		for (Forum forum : forumList) {
			DTOForum dto = new DTOForum();
			dto.setTitle(forum.getTitle());
			dto.setId(forum.getId());
			dtoList.add(dto);
		}

		return dtoList;
	}

	public List<DTOSkill> listAllSkillsOfForum(int forumId) {

		Collection<Skill> skillList = forumDao.getAssociatedSkills(forumId, "forumThatHaveThisSkill");
		List<DTOSkill> dtoList = new ArrayList<>();

		for (Skill skill : skillList) {
			DTOSkill dto = skillDao.convertEntityToDto(skill);
			dtoList.add(dto);
		}
		return dtoList;
	}

	public List<DTOInterest> listAllInterestsOfForum(int forumId) {

		Collection<Interest> interestList = forumDao.getInterestsAssociatedWithForum(forumId,
				"forumThatHaveThisInterest");

		List<DTOInterest> dtoList = new ArrayList<>();

		for (Interest interest : interestList) {
			DTOInterest dto = interestDao.convertEntityToDto(interest);
			dtoList.add(dto);
		}

		return dtoList;
	}

}
