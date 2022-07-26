package pt.uc.dei.projfinal.service;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;
import javax.naming.NamingException;

import org.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import pt.uc.dei.projfinal.dao.DAOConfigurations;
import pt.uc.dei.projfinal.dao.DAOUser;
import pt.uc.dei.projfinal.dto.DTOUser;
import pt.uc.dei.projfinal.dto.DTOUserComplete;
import pt.uc.dei.projfinal.entity.Configurations;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.User.UserType;
import pt.uc.dei.projfinal.entity.User.VisibilityUser;
import pt.uc.dei.projfinal.utilities.Encryption;
import pt.uc.dei.projfinal.utilities.SendHTMLEmail;

@RequestScoped
public class UserService implements Serializable {

	private static final long serialVersionUID = 1L;

	@Inject
	private DAOUser userDao;
	@Inject
	private DAOConfigurations configDao;

	public UserService() {
	}

	// método utilizado pelo user comum e pelo admin para poder registar novos
	// utilizadores - auto-registo
	public void createUser(DTOUserComplete infoUser) throws Exception {

		Configurations config = configDao.getConfiguration("salt");
		String salt;
		if (config == null) {
			salt = "/17%3O|8eI";
			Configurations configAux = new Configurations();
			configAux.setKeyword("salt");
			configAux.setValue("/17%3O|8eI");
			configDao.persist(configAux);
		} else {
			salt = config.getValue();
		}
		String password = infoUser.getPassword();
		password = password + salt + infoUser.getEmail();
		System.out.println(password);
		infoUser.setPassword(Encryption.encryptPassword(password));
		User userEntity = userDao.convertDtoToEntity(infoUser);
		userEntity.setVisilibityUser(VisibilityUser.PUBLIC);
		userEntity.setTypeUser(UserType.VISITOR);
		userEntity.setTemporaryToken(UUID.randomUUID().toString());
		userDao.persist(userEntity);
		sendRegistrationValidationEmail(userEntity.getEmail(), userEntity.getTemporaryToken());

	}

	// Método para enviar o e-mail de validação do registo de um novo user
	public void sendRegistrationValidationEmail(String emailReceiver, String token) throws NamingException {
		SendHTMLEmail.triggerEmailRegistration(emailReceiver, token);
	}

	// método para buscar user pelo token
	public User findUserByToken(String temporaryToken) throws Exception {
		// System.out.println("findUserByToken");
		return userDao.findUserByToken(temporaryToken);
	}

	// método para promover o utilizador de visitante para utilizador padrão
	public void promoteToStandardUser(User user) throws Exception {
		// System.out.println("promoteToStandardUser");
		user.setTypeUser(UserType.STANDARD);
		user.setTemporaryToken(null);// retirar token provisório
		userDao.merge(user);
	}

	// método para poder enviar o email para o utilizador poder fazer reset da
	// password
	public boolean sendEmailToResetPassword(String email) throws NamingException {
		User user = userDao.find(email);

		if (user == null) {
			return false;
		}

		user.setTemporaryToken(UUID.randomUUID().toString());
		userDao.merge(user);
		SendHTMLEmail.triggerEmailResetPassword(email, user.getTemporaryToken());
		return true;
	}

	// método para encontrar o utilizador através do seu email
	public User findUser(String email) throws Exception {
		return userDao.find(email);
	}

	// método para fazer o login do utilizador
	public boolean login(String email, String password) throws Exception {
		Configurations config = configDao.getConfiguration("salt");
		String salt;

		if (config == null) {
			salt = "/17%3O|8eI";
			Configurations configAux = new Configurations();
			configAux.setKeyword("salt");
			configAux.setValue("/17%3O|8eI");
			configDao.persist(configAux);
		} else {
			salt = config.getValue();
		}
		password = password + salt + email;
		User user = userDao.findByUserInfo(email, Encryption.encryptPassword(password));

		if (user == null) {
			return false;
		} else {
			return true;
		}
	}

	// Método responsável por fazer o reset com a nova password informada pelo user
	public void doResetPassword(User user, String newPassword) throws Exception {
		String password = separateStringJson(newPassword, "password");
		System.out.println(" Vou mudar --- newPassword " + password);

		Configurations config = configDao.getConfiguration("salt");
		String salt;
		if (config == null) {
			salt = "/17%3O|8eI";
			Configurations configAux = new Configurations();
			configAux.setKeyword("salt");
			configAux.setValue("/17%3O|8eI");
			configDao.persist(configAux);
		} else {
			salt = config.getValue();
		}

		password = password + salt + user.getEmail();

		user.setPassword(Encryption.encryptPassword(password));
		user.setTemporaryToken(null);

		userDao.merge(user);
	}

	// Método responsável por somente alterar a visibilidade da area pessoal de um
	// user
	// A nova visibilidade vem do frontend pelo body da requisição no formato
	// {"visilibityUser": "PRIVADA"}
	public void changeVisibility(User user, String visibility) throws Exception {

		String newVisibility = separateStringJson(visibility, "visilibityUser");
		List<User> userViewerList = new ArrayList<>();

		switch (newVisibility) {
		case "PUBLIC":
			user.setVisilibityUser(VisibilityUser.PUBLIC);
			user.setUsersWhoCanView(userViewerList);
			break;
		case "PRIVATE":
			user.setVisilibityUser(VisibilityUser.PRIVATE);
			user.setUsersWhoCanView(userViewerList);
			break;
		case "ESPECIFIC":
			user.setVisilibityUser(VisibilityUser.ESPECIFIC);
			break;
		default:
			break;
		}
		userDao.merge(user);
	}

	// método utilizado pelo user para editar perfil
	public void editUserProfile(DTOUserComplete infoUser, User userToUpdate) throws Exception {

		User userEntity = userDao.convertCompleteDtoToEntity(infoUser, userToUpdate);
		userDao.merge(userEntity);
	}

	// Listar users pesquisados por nome/alcunha
	public List<DTOUser> getUsersByNameOrNickname(String searchKey) throws Exception {

		System.out.println("getUsersByNameOrNickname - service");

		List<User> users = userDao.searchForUserByNameOrNickname(searchKey);
		List<DTOUser> usersDto = new ArrayList<DTOUser>();

		for (User user : users) {
			DTOUser userDto = userDao.convertEntityToDto(user);
			usersDto.add(userDto);
		}
		return usersDto;
	}

	public List<DTOUser> filterUsersByNameOrNickname(String searchKey, String emailOwnerPage) {

		// Buscar a lista de visualizadores
		List<User> usersViewerList = userDao.getListUsersWhoCanView(emailOwnerPage);
		String keywordLowerCase = searchKey.toLowerCase();
		List<User> resultList = new ArrayList<User>();
		boolean found = false;

		// se tiver users na lista de viewers atual
		if (usersViewerList.get(0) != null) {

			for (User user : usersViewerList) {
				found = false;

				if (user.getFirstName().toLowerCase().equals(keywordLowerCase)) {
					found = true;
				}

				if (user.getLastName().toLowerCase().equals(keywordLowerCase)) {
					found = true;
				}

				// Nickname é opcional, user pode ter ou não alcunha registada
				if (user.getNickname() != null) {
					if (user.getNickname().toLowerCase().equals(keywordLowerCase)) {
						found = true;
						// resultList.add(user);
					}
				}

				if (found == true) {
					resultList.add(user);
				}
			}
		}

		List<DTOUser> dtoList = new ArrayList<DTOUser>();
		if (resultList.size() > 0) {
			for (User user : resultList) {
				DTOUser dto = userDao.convertEntityToDto(user);
				dtoList.add(dto);
			}

		}

		return dtoList;
	}

	public boolean addUserToViewerListOneByOne(User userToEdit, User userToAdd) throws Exception {

		boolean viewerExists = false;
		List<User> userViewerList = userDao.getListUsersWhoCanView(userToEdit.getEmail());

		if (userViewerList.get(0) != null) {
			for (User user : userViewerList) {
				if (user.getEmail().equals(userToAdd.getEmail())) {
					viewerExists = true;
				}

			}
		}

		// Se ainda não consta na lista de viewers
		if (!viewerExists) {
			userViewerList.add(userToAdd);
			userToEdit.setUsersWhoCanView(userViewerList);
			userDao.merge(userToEdit);
			return true;
		} else {
			return false;
		}

	}

	// Recebe o valor em StringJson enviado pelo front, separa e devolve somente o
	// valor da variável sem aspas
	public String separateStringJson(String stringJson, String key) throws Exception {

		String value = String.valueOf(new Gson().fromJson(stringJson, JsonObject.class).get(key));
		value = value.substring(1, value.length() - 1);
		return value;
	}

	public DTOUserComplete getUserByEmail(User user) throws Exception {
		return userDao.convertEntityToDtoComplete(user);
	}

	public DTOUser getUserByEmailSimple(String email) throws Exception {
		return userDao.convertEntityToDto(userDao.find(email));
	}

	public void removeUserToViewerList(User userToEdit, User userToRemove) throws Exception {

		List<User> userViewerList = userDao.getListUsersWhoCanView(userToEdit.getEmail());
		userViewerList.removeIf(user -> user.getEmail().equals(userToRemove.getEmail()));
		userToEdit.setUsersWhoCanView(userViewerList);
		userDao.merge(userToEdit);
	}

	public void manageSessionTimeout(int timeout) throws Exception {

		Configurations config = configDao.getConfiguration("timeout");

		if (config == null) {

			Configurations configAux = new Configurations();
			configAux.setKeyword("timeout");
			configAux.setValue(String.valueOf(timeout));
			configDao.persist(configAux);

		} else {

			config.setValue(String.valueOf(timeout));
			configDao.merge(config);
		}
	}

	public int getTimeoutForSession() throws Exception {
		Configurations config = configDao.getConfiguration("timeout");

		if (config == null) {
			Configurations configAux = new Configurations();
			configAux.setKeyword("timeout");
			configAux.setValue(String.valueOf(60));
			configDao.persist(configAux);
			return 60;
		}
		return Integer.parseInt(config.getValue());
	}

	public void upgradeUserToAdmin(User userToChange) throws Exception {
		userToChange.setTypeUser(UserType.ADMINISTRATOR);
		userDao.merge(userToChange);

	}

	public void dispromoteAdminToUserStandard(User userToChange) throws Exception {
		userToChange.setTypeUser(UserType.STANDARD);
		userDao.merge(userToChange);
	}

	// Verificar se user é admin do sistema ou se user é owner/escreveu o comentário
	public boolean hasAuthorizationToEdit(User loggedUser, User userToEdit) throws Exception {

		// se o user logado é admin OU se é o mesmo do user a ser editado
		if (loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)
				|| loggedUser.getEmail().equals(userToEdit.getEmail())) {
			// o user que quer adicionar um viewer precisa ter visibilidade especifica
			if (userToEdit.getVisilibityUser().equals(VisibilityUser.ESPECIFIC)) {
				return true;// tem autorização para adicionar viewers
			}
		}
		return false;
	}

	// ADD VIEWER LIST SOMENTE POR WORKPLACE
	public void addUserToViewerListByWorkplace(String workplace, User userToEdit) throws Exception {

		// Buscar todos os Users NÂO visitantes com aquele local de trabalho
		List<User> usersToAdd = userDao.getUsersByWorkplace(workplace);
		// buscar lista de viewers do loggedUser
		List<User> usersViewerList = userDao.getListUsersWhoCanView(userToEdit.getEmail());
		List<User> auxiliaryList = new ArrayList<User>();
		auxiliaryList.addAll(usersToAdd);

		// se tiver users na lista de viewers atual
		if (usersViewerList.get(0) != null) {
			// percorrer lista atual de viewers
			for (int i = 0; i < usersViewerList.size(); i++) {

				// comparando cada viewer com o novo user a ser add
				// System.out.println("user da minha listaaaa" + usersViewerList.get(i));
				for (int j = 0; j < usersToAdd.size(); j++) {
					// System.out.println("user que quero add" + usersToAdd.get(j));
					if (usersViewerList.get(i).getEmail().equals(usersToAdd.get(j).getEmail())
							|| usersToAdd.get(j).getEmail().equals(userToEdit.getEmail())) {
						// System.out.println("primeira condiçãoooooo" +
						// usersViewerList.get(i).getEmail() + " ahahah "
						// + (usersToAdd.get(j).getEmail()));
						int aux = j;
						auxiliaryList.removeIf(user -> user.getEmail().equals(usersToAdd.get(aux).getEmail()));

					}
				}

			}
			usersViewerList.addAll(auxiliaryList);

		} else {// não tem nada na lista de viewers atual

			usersViewerList.remove(0);
			for (User user : usersToAdd) {
				if (!user.getEmail().equals(userToEdit.getEmail())) {
					usersViewerList.add(user);
				}
			}
		}

		// Guardar a lista de viewers atualizada
		userToEdit.setUsersWhoCanView(usersViewerList);
		userDao.merge(userToEdit);

	}

	// ADD VIEWER LIST SOMENTE POR SKILL
	public void addUserToViewerListBySkills(User userToEdit, List<Integer> idsList) throws Exception {

		System.out.println("addUserToViewerListBySkills");

		List<User> usersToAdd = new ArrayList<User>();
		int size = idsList.size();

		if (size == 1) {
			// chamar criteria simples para buscar utilizadores que tem aquela skill
			usersToAdd = userDao.getUsersByAssociateSkill(idsList.get(0));

		} else {
			// chamar criteria com .in()
			usersToAdd = userDao.getUsersByAssociateSkillsList(idsList); // enviar os ids para a query
		}

		List<User> finalList = generatorUsersFinalList(usersToAdd, size);
		// System.out.println("voltei de generatorUsersFinalList");
		// System.out.println(finalList);
		// evitar que sejam add pessoas repetidas ou o próprio user
		List<User> usersToPersist = updateViewersList(userToEdit, finalList);
		// System.out.println("voltei do método com a lista de viewers atualizada *** "
		// + usersToPersist);

		// Guardar a lista de viewers atualizada
		userToEdit.setUsersWhoCanView(usersToPersist);
		userDao.merge(userToEdit);

	}

	// ADD VIEWER LIST SOMENTE POR Interests
	public void addUserToViewerListByInterests(User userToEdit, List<Integer> idsList) throws Exception {

		List<User> usersToAdd = new ArrayList<User>();
		int size = idsList.size();

		if (size == 1) {
			// chamar criteria simples para buscar utilizadores que tem aquela skill
			usersToAdd = userDao.getUsersByAssociateInterest(idsList.get(0));

		} else {
			// chamar criteria com .in()
			usersToAdd = userDao.getUsersByAssociateInterestsList(idsList); // enviar os ids para a query
		}

		List<User> finalList = generatorUsersFinalList(usersToAdd, idsList.size());
		// evitar que sejam add pessoas repetidas ou o próprio user
		List<User> usersToPersist = updateViewersList(userToEdit, finalList);

		// Guardar a lista de viewers atualizada
		userToEdit.setUsersWhoCanView(usersToPersist);
		userDao.merge(userToEdit);

	}

	// ADD VIEWER LIST POR WORKPLACE && SKILL
	public void addUserToViewerListBySkillsAndWorkplace(User userToEdit, List<Integer> idsList, String workplace)
			throws Exception {

		List<User> usersToAdd = new ArrayList<User>();
		int size = idsList.size();

		if (size == 1) {
			// chamar criteria simples para buscar utilizadores que tem aquela skill
			usersToAdd = userDao.getUsersByWorkplaceAndSingleSkill(idsList.get(0), workplace);

		} else {
			// chamar criteria com .in()
			usersToAdd = userDao.getUsersByWorkplaceAndSkills(idsList, workplace); // enviar os ids para a query
		}

		// traz todos que tenham uma ou outra skill, não são visitantes e tem um
		// determinado workplace

		List<User> finalList = generatorUsersFinalList(usersToAdd, idsList.size());
		// System.out.println("voltei de generatorUsersFinalList");
		// System.out.println(finalList);

		// evitar que sejam add pessoas repetidas ou o próprio user
		List<User> usersToPersist = updateViewersList(userToEdit, finalList);
		// System.out.println("voltei do método com a lista de viewers atualizada *** "
		// + usersToPersist);

		// Guardar a lista de viewers atualizada
		userToEdit.setUsersWhoCanView(usersToPersist);
		// System.out.println("vou no merge");
		userDao.merge(userToEdit);

	}

	// ADD VIEWER LIST POR WORKPLACE && INTEREST
	public void addUserToViewerListByInterestAndWorkplace(User userToEdit, List<Integer> idsList, String workplace)
			throws Exception {

		List<User> usersToAdd = new ArrayList<User>();
		int size = idsList.size();

		if (size == 1) {
			// chamar criteria simples para buscar utilizadores que tem aquele interesse
			usersToAdd = userDao.getUsersByWorkplaceAndSingleInterest(idsList.get(0), workplace);

		} else {
			// chamar criteria com .in()
			usersToAdd = userDao.getUsersByWorkplaceAndInterest(idsList, workplace); // enviar os ids para a query

		}

		System.out.println(idsList);

		// traz todos que tenham uma ou outra skill, não são visitantes e tem um
		// determinado workplace

		List<User> finalList = generatorUsersFinalList(usersToAdd, idsList.size());
		// System.out.println("voltei de generatorUsersFinalList");
		// System.out.println(finalList);

		// evitar que sejam add pessoas repetidas ou o próprio user
		List<User> usersToPersist = updateViewersList(userToEdit, finalList);
		// System.out.println("voltei do método com a lista de viewers atualizada *** "
		// + usersToPersist);

		// Guardar a lista de viewers atualizada
		userDao.merge(userToEdit);

	}

	// ADD VIEWER LIST PELOS TRES CRITERIOS
	public void addUserToViewerListBySkillsAndInterestsAndWorkplace(User userToEdit, List<Integer> idsSkillsList,
			List<Integer> idsInterestList, String workplace) throws Exception {

		// auxiliares
		List<User> usersToAdd = new ArrayList<User>();
		List<User> usersToPersist = new ArrayList<User>();
		int sizeSkills = idsSkillsList.size();
		int sizeInterests = idsInterestList.size();

		// Separar os casos para ir a BD na query respetiva

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//////// multiplos skills e multiplos interesses
		if (sizeSkills > 1 && sizeInterests > 1) {
			// buscar na BD
			usersToAdd = userDao.getUsersByInterestsAndSkillsAndWorkplace(idsSkillsList, idsInterestList, workplace);
			// System.out.println("voltei do dao 1 com a lista " + usersToAdd);

			// Gerar a lista final
			List<User> finalList = generatorUsersFinalList(usersToAdd, sizeSkills + sizeInterests);
			// System.out.println("voltei de generatorUsersFinalList " + finalList);

			// evitar repetidos
			usersToPersist = updateViewersList(userToEdit, finalList);
			// System.out.println("voltei do método com a lista de viewers atualizada *** "
			// + usersToPersist);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			//////// um interesse e várias skills
		} else if (sizeSkills > 1 && sizeInterests == 1) {
			// buscar na bd
			usersToAdd = userDao.getUsersBySingleInterestsAndSkillsAndWorkplace(idsSkillsList, idsInterestList.get(0),
					workplace);
			// System.out.println("voltei do dao 2 com a lista " + usersToAdd);

			// Gerar a lista final
			List<User> finalList = generatorUsersFinalList(usersToAdd, sizeSkills);
			// System.out.println("voltei de generatorUsersFinalList " + finalList);

			// evitar repetidos
			usersToPersist = updateViewersList(userToEdit, finalList);
			// System.out.println("voltei do método com a lista de viewers atualizada *** "
			// + usersToPersist);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			//////// uma skill e vários interesses
		} else if (sizeInterests > 1 && sizeSkills == 1) {
			// buscar na bd
			usersToAdd = userDao.getUsersByInterestsAndSingleSkillAndWorkplace(idsSkillsList.get(0), idsInterestList,
					workplace);
			// System.out.println("voltei do dao 3 com a lista " + usersToAdd);

			// Gerar a lista final
			List<User> finalList = generatorUsersFinalList(usersToAdd, sizeInterests);
			// System.out.println("voltei de generatorUsersFinalList " + finalList);

			// evitar repetidos
			usersToPersist = updateViewersList(userToEdit, finalList);
			// System.out.println("voltei do método com a lista de viewers atualizada *** "
			// + usersToPersist);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			//////// somente uma skill & somente um interesse
		} else {

			usersToAdd = userDao.getUsersByInterestsAndSkillsAndWorkplaceSingleCase(idsSkillsList.get(0),
					idsInterestList.get(0), workplace);
			// System.out.println("voltei do dao 4 com a lista " + usersToAdd);

			// evitar que sejam add pessoas repetidas ou o próprio user
			usersToPersist = updateViewersList(userToEdit, usersToAdd);
			// System.out.println("voltei do método com a lista de viewers atualizada *** "
			// + usersToPersist);

		} // fim dos ifs

		// System.out.println("sai dos ifs com a lista para persistir na bd: " +
		// usersToPersist);

		// Guardar a lista de viewers atualizada
		userToEdit.setUsersWhoCanView(usersToPersist);
		// System.out.println("vou no merge");
		userDao.merge(userToEdit);
	}

	// METODO AUXILIAR
	public List<User> generatorUsersFinalList(List<User> usersToAdd, int sizeIdsList) throws Exception {

		List<User> usersFinalList = new ArrayList<User>();
		int emailsCounter = 1;
		// ver quem aparece a mesma qtde de vezes do que a quantidade de ids que
		// estou buscando, pois esta pessoa teria tudo da busca

		for (int i = 0; i < usersToAdd.size(); i++) {
			for (int j = i + 1; j < usersToAdd.size(); j++) {
				// System.out.println("size 2 for " + usersToAdd.size());
				// System.out.print(" i: " + i + " - J: " + j);
				if (usersToAdd.get(i).getEmail().equals(usersToAdd.get(j).getEmail())) {
					emailsCounter++;
				}
			} // fim for j

			if (emailsCounter == sizeIdsList) {
				usersFinalList.add(usersToAdd.get(i));
			}

			emailsCounter = 1;

		} // fim for i

		return usersFinalList;
	}

	// METODO AUXILIAR - comparar lista de amigos atual com os novos aamigos a
	// adicionar
	// para evitar repetidos
	public List<User> updateViewersList(User userToEdit, List<User> usersFinalList) throws Exception {

		// buscar lista de viewers do loggedUser
		List<User> usersWhoCanView = userDao.getListUsersWhoCanView(userToEdit.getEmail());
		List<User> auxiliaryList = new ArrayList<User>();

		int counter = 0;
		// se tiver users na lista de viewers atual
		if (usersWhoCanView.get(0) != null) {
			// System.out.println("entrei no if");
			for (int i = 0; i < usersFinalList.size(); i++) {// percorre lista de novos amigos
				for (int j = 0; j < usersWhoCanView.size(); j++) {// buscando se este novo amigo existe já na lista de
																	// amigos atual
					// System.out.print(" i: " + i + " - J: " + j);
					// comparando cada viewer com o novo user a ser add e com o user que vai
					// adicionar pessoas

					// Se este novo amigo já está na lista ou se é o próprio user
					if (usersFinalList.get(i).getEmail().equals(usersWhoCanView.get(j).getEmail())
							|| usersFinalList.get(i).getEmail().equals(userToEdit.getEmail())) {
						counter++;
					}
				} // fim for j
					//
				if (counter == 0) {
					auxiliaryList.add(usersFinalList.get(i));
				}
				counter = 0;
			} // fim for i
			usersWhoCanView.addAll(auxiliaryList);

		} else {// não tem nada na lista de viewers atual

			usersWhoCanView.remove(0); // a consulta recursiva devolve a posição 0 ocupada com null
			for (User user : usersFinalList) {
				if (!user.getEmail().equals(userToEdit.getEmail())) {
					usersWhoCanView.add(user);
				}
			}
		}

		return usersWhoCanView;
	}

	// Somente interesses e skills SEM workplace
	public void addUserToViewerListBySkillsAndInterests(User userToEdit, List<Integer> idsSkillsList,
			List<Integer> idsInterestList) throws Exception {

		// auxiliares
		List<User> usersToAdd = new ArrayList<User>();// recebe o que vem da bd
		List<User> usersToPersist = new ArrayList<User>();
		int sizeSkills = idsSkillsList.size();
		int sizeInterests = idsInterestList.size();

		// Separar os casos para ir a BD na query respetiva

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////
		//////// multiplos skills e multiplos interesses
		if (sizeSkills > 1 && sizeInterests > 1) {

			// Search na bd
			usersToAdd = userDao.getUsersBySkillsAndInterests(idsSkillsList, idsInterestList);
			//System.out.println("voltei do dao 1 com os users: " + usersToAdd);

			// Gerar a lista final
			List<User> finalList = generatorUsersFinalList(usersToAdd, sizeSkills + sizeInterests);
			//System.out.println("voltei de generatorUsersFinalList " + finalList);

			// evitar repetidos
			usersToPersist = updateViewersList(userToEdit, finalList);
			//System.out.println("voltei do método com a lista de viewers atualizada *** " + usersToPersist);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			//////// uma skill e um interesse
		} else if (sizeSkills == 1 && sizeInterests == 1) {

			// Search na bd
			usersToAdd = userDao.getUsersBySingleSkillAndSingleInterest(idsSkillsList.get(0), idsInterestList.get(0));
			//System.out.println("voltei do dao 2 com os users: " + usersToAdd);

			// evitar que sejam add pessoas repetidas ou o próprio user
			usersToPersist = updateViewersList(userToEdit, usersToAdd);
			//System.out.println("voltei do método com a lista de viewers atualizada *** " + usersToPersist);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			//////// uma skill e vários interesses
		} else if (sizeSkills == 1 && sizeInterests > 1) {

			// Search na bd
			usersToAdd = userDao.getUsersBySingleSkillAndInterests(idsSkillsList.get(0), idsInterestList);
			//System.out.println("voltei do dao 3 com os users: " + usersToAdd);

			// Gerar a lista final
			List<User> finalList = generatorUsersFinalList(usersToAdd, sizeInterests);
			//System.out.println("voltei de generatorUsersFinalList " + finalList);

			// evitar repetidos
			usersToPersist = updateViewersList(userToEdit, finalList);
			//System.out.println("voltei do método com a lista de viewers atualizada *** " + usersToPersist);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			//////// várias skills e um interesse
		} else if (sizeSkills > 1 && sizeInterests == 1) {

			// Search na bd
			usersToAdd = userDao.getUsersBySkillsAndSingleInterests(idsSkillsList, idsInterestList.get(0));

			// Gerar a lista final
			List<User> finalList = generatorUsersFinalList(usersToAdd, sizeSkills);
			//System.out.println("voltei de generatorUsersFinalList " + finalList);

			// evitar repetidos
			usersToPersist = updateViewersList(userToEdit, finalList);
			//System.out.println("voltei do método com a lista de viewers atualizada *** " + usersToPersist);

		} // fim dos ifs

		// Guardar a lista de viewers atualizada
		userToEdit.setUsersWhoCanView(usersToPersist);
		userDao.merge(userToEdit);
	}

	// Recebe o pedido de add por grupos, separa e chama os respetivos métodos
	public void addViewerListSupport(User userToEdit, String idsJson, String workplace) throws Exception {

		// Separar os ids de Skills
		JsonArray jArraySkill = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsSkills");
		List<Integer> idsSkillsList = new ArrayList<Integer>();

		for (int i = 0; i < jArraySkill.size(); i++) {
			idsSkillsList.add(new Gson().fromJson(jArraySkill.get(i), Integer.class));
		}

		// Separar os ids de Interesses
		JsonArray jArrayInterest = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsInterest");
		List<Integer> idsInterestList = new ArrayList<Integer>();

		for (int i = 0; i < jArrayInterest.size(); i++) {
			idsInterestList.add(new Gson().fromJson(jArrayInterest.get(i), Integer.class));
		}

		int skillsSize = idsSkillsList.size();
		int interestsSize = idsInterestList.size();

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// add somente por workplace
		if (!workplace.equals("empty") && interestsSize == 0 && skillsSize == 0) {
			addUserToViewerListByWorkplace(workplace, userToEdit);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// add por workplace e interesses
		} else if (!workplace.equals("empty") && interestsSize > 0 && skillsSize == 0) {
			addUserToViewerListByInterestAndWorkplace(userToEdit, idsInterestList, workplace);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// add por workplace e skills
		} else if (!workplace.equals("empty") && interestsSize == 0 && skillsSize > 0) {
			addUserToViewerListBySkillsAndWorkplace(userToEdit, idsSkillsList, workplace);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// add somente por interesses
		} else if (workplace.equals("empty") && interestsSize > 0 && skillsSize == 0) {
			addUserToViewerListByInterests(userToEdit, idsInterestList);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// add somente por skills
		} else if (workplace.equals("empty") && interestsSize == 0 && skillsSize > 0) {
			addUserToViewerListBySkills(userToEdit, idsSkillsList);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// add por interesse e skills
		} else if (interestsSize > 0 && skillsSize > 0 && workplace.equals("empty")) {
			addUserToViewerListBySkillsAndInterests(userToEdit, idsSkillsList, idsInterestList);

			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// add por workplace, interesse e skills
		} else {
			addUserToViewerListBySkillsAndInterestsAndWorkplace(userToEdit, idsSkillsList, idsInterestList, workplace);
		}
	}

	// busca ativa por workplace
	public List<String> activeSearchByWorkplace(String workplace) throws Exception {
		// 
		return userDao.activeSearchByWorkplace(workplace);
	}

	public List<String> activeSearchByWorkplaceViewerList(String workplace, String emailUserToEdit) {
		// 
		return userDao.activeSearchByWorkplaceViewerList(emailUserToEdit, workplace);
	}

	// remove todos os users da viewer list
	public void removeAllUsersToViewerList(User userToEdit) throws Exception {
		List<User> userViewerList = userDao.getListUsersWhoCanView(userToEdit.getEmail());
		userViewerList.clear();
		userToEdit.setUsersWhoCanView(userViewerList);
		userDao.merge(userToEdit);
	}

	// remove todos os users da viewer list que sejam daquele workplace
	public void removeUsersToViewerListByWorkplace(User userToEdit, String workplace) {

		
		List<User> userViewerList = userDao.getListUsersWhoCanView(userToEdit.getEmail());
		userViewerList.removeIf(user -> user.getWorkplace().equals(workplace.toUpperCase()));
		userToEdit.setUsersWhoCanView(userViewerList);
		userDao.merge(userToEdit);

	}

	public void changePassword(User loggedUser, String json) {
		JSONObject jsonObj = new JSONObject(json);

		System.out.println(jsonObj.get("password"));

		String aux = String.valueOf(jsonObj.get("password"));

		Configurations config = configDao.getConfiguration("salt");
		String salt;
		if (config == null) {
			salt = "/17%3O|8eI";
			Configurations configAux = new Configurations();
			configAux.setKeyword("salt");
			configAux.setValue("/17%3O|8eI");
			configDao.persist(configAux);
		} else {
			salt = config.getValue();
		}

		String password = aux;
		password = password + salt + loggedUser.getEmail();

		loggedUser.setPassword(Encryption.encryptPassword(password));

		userDao.merge(loggedUser);
	}

	public List<DTOUser> getUsersWhoCanViewList(String email) throws Exception {

		List<User> usersViewerList = userDao.getListUsersWhoCanView(email);
		List<DTOUser> dtoList = new ArrayList<DTOUser>();

		// se tiver users na lista de viewers atual
		if (usersViewerList.get(0) == null) {

			usersViewerList.remove(0);
		}

		for (User user : usersViewerList) {
			DTOUser dto = userDao.convertEntityToDto(user);
			dtoList.add(dto);
		}

		return dtoList;
	}

	public boolean checkAuthToEdit(User loggedUser, User userToEdit) {

		if (loggedUser.getEmail().equals(userToEdit.getEmail())) {
			return true;
		}
		if (loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {
			return true;
		}
		return false;
	}

	public List<DTOUser> getAll() throws Exception {
		List<User> users = userDao.getAllUsers();
		List<DTOUser> dtoList = new ArrayList<>();

		for (User user : users) {
			DTOUser dto = userDao.convertEntityToDto(user);
			dtoList.add(dto);
		}

		return dtoList;
	}

	public JSONObject getTimeOutObj() throws Exception {

		int timeout = getTimeoutForSession();
		JSONObject obj = new JSONObject();
		obj.put("timeout", timeout);
		return obj;
	}

}
