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
import pt.uc.dei.projfinal.dao.DAOProject;
import pt.uc.dei.projfinal.dao.DAOSkill;
import pt.uc.dei.projfinal.dao.DAOUser;
import pt.uc.dei.projfinal.dto.DTOInterest;
import pt.uc.dei.projfinal.dto.DTOMessageComplete;
import pt.uc.dei.projfinal.dto.DTOSkill;
import pt.uc.dei.projfinal.entity.Forum;
import pt.uc.dei.projfinal.entity.Interest;
import pt.uc.dei.projfinal.entity.Member;
import pt.uc.dei.projfinal.entity.Member.MemberStatus;
import pt.uc.dei.projfinal.entity.Message;
import pt.uc.dei.projfinal.entity.Project;
import pt.uc.dei.projfinal.entity.Skill;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.User.UserType;

@RequestScoped
public class SkillService implements Serializable {

	private static final long serialVersionUID = 1L;

	@Inject
	DAOSkill skillDao;
	@Inject
	DAOUser userDao;
	@Inject
	DAOProject projectDao;
	@Inject
	DAOForum forumDao;

	public SkillService() {

	}

	// método para criar uma nova skill
	public int createSkill(DTOSkill skillDto) throws Exception {

		// Verificar se a skill que veio no dto já existe na BD
		Skill skillAux = skillDao.GetSkillByTitle(skillDto.getTitle());

		// Se existe retorna logo o id desta skill e nem mesmo cria outra skill
		if (skillAux != null) {
			return skillAux.getId();
		}

		// ver se a skill já existe e se existir devolver o id da skills que já existe
		Skill skill = skillDao.convertDtoToEntity(skillDto);
		skillDao.persist(skill);
		return skill.getId();

	}

	// método para associar uma/várias skill a um user
	public void associateSkillToUser(User loggedUser, String idsJson) throws Exception {

		// Separar os ids de Skills
		JsonArray jArraySkill = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsSkills");
		List<Integer> idsSkillsList = new ArrayList<Integer>();

		for (int i = 0; i < jArraySkill.size(); i++) {
			idsSkillsList.add(new Gson().fromJson(jArraySkill.get(i), Integer.class));
		}

		// Associar cada skill recebida ao user logado
		for (Integer skillId : idsSkillsList) {

			Skill skill = skillDao.find(skillId);

			System.out.println("associateSkillToUser service");

			Collection<Skill> userSkills = userDao.getAssociatedSkills(loggedUser.getEmail(), "usersWhoHaveThisSkill");
			Collection<User> usersWhoHaveThisSkill = skillDao.getAssociatedUsers(skillId, "userSkillList");

			System.out.println(usersWhoHaveThisSkill);

			boolean exist = false;
			for (Skill skillAux : userSkills) {
				if (skillAux.getId() == skillId) {
					exist = true;
					break;
				}
			}
			// falta prevenir que não adiciona repetido!

			if (!exist) {

				userSkills.add(skill);
				usersWhoHaveThisSkill.add(loggedUser);

				loggedUser.setUserSkillList(userSkills);
				skill.setUsersWhoHaveThisSkill(usersWhoHaveThisSkill);

				userDao.merge(loggedUser);
				skillDao.merge(skill);
			}
		}
	}

	// método para desassociar uma/várias skill do user logado
	public void desassociateSkillFromUser(User user, String idsJson) throws Exception {

		// Separar os ids de Skills
		JsonArray jArraySkill = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsSkills");
		List<Integer> idsSkillsList = new ArrayList<Integer>();

		for (int i = 0; i < jArraySkill.size(); i++) {
			idsSkillsList.add(new Gson().fromJson(jArraySkill.get(i), Integer.class));
		}

		// Associar cada skill recebida ao user logado
		for (Integer skillId : idsSkillsList) {
			//
			Skill skill = skillDao.find(skillId);

			Collection<Skill> userSkills = userDao.getAssociatedSkills(user.getEmail(), "usersWhoHaveThisSkill");
			Collection<User> usersWhoHaveThisSkill = skillDao.getAssociatedUsers(skillId, "userSkillList");

			userSkills.removeIf(skillAux -> skillAux.getId() == skillId);
			usersWhoHaveThisSkill.removeIf(userAux -> userAux.getEmail().equals(user.getEmail()));

			user.setUserSkillList(userSkills);
			skill.setUsersWhoHaveThisSkill(usersWhoHaveThisSkill);

			userDao.merge(user);
			skillDao.merge(skill);
		}
	}

	// método para associar uma/várias skill a um projeto
	public void associateSingleOrMultipleSkillsToProject(int projectId, String idsJson) throws Exception {

		// Separar os ids de Skills
		JsonArray jArraySkill = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsSkills");
		List<Integer> idsSkillsList = new ArrayList<Integer>();

		for (int i = 0; i < jArraySkill.size(); i++) {
			idsSkillsList.add(new Gson().fromJson(jArraySkill.get(i), Integer.class));
		}

		// System.out.println(idsSkillsList);

		// Associar cada skill recebida àquele projeto
		for (Integer skillId : idsSkillsList) {

			// caso não encontre algo, o throws devolve esceção para o catch do controller e
			// pronto
			Skill skill = skillDao.find(skillId);
			Project project = projectDao.find(projectId);

			Collection<Skill> skillList = projectDao.getSkillsAssociatedWithProject(projectId,
					"projectsThatHaveThisSkill");
			Collection<Project> projectsWithThisSkill = skillDao.getAssociatedProjects(skillId,
					"skillsAssociatedWithProject");

			boolean exist = false;
			for (Skill skillAux : skillList) {
				if (skillAux.getId() == skillId) {
					exist = true;
					break;
				}
			}

			if (!exist) {
				skillList.add(skill);
				projectsWithThisSkill.add(project);
				System.out.println(skillList.size());
				System.out.println(projectsWithThisSkill.size());

				skill.setProjectsThatHaveThisSkill(projectsWithThisSkill);
				project.setSkillsAssociatedWithProject(skillList);

				projectDao.merge(project);
				skillDao.merge(skill);
			}
		}
	}

	// método para desassociar uma skill de um projeto
	public boolean desassociateSkillFromProject(int projectId, String idsJson) throws Exception {

		// Separar os ids de Skills
		JsonArray jArraySkill = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsSkills");
		List<Integer> idsSkillsList = new ArrayList<Integer>();

		for (int i = 0; i < jArraySkill.size(); i++) {
			idsSkillsList.add(new Gson().fromJson(jArraySkill.get(i), Integer.class));
		}

		Project project = projectDao.find(projectId);

		if (project == null) {
			return false;
		}

		for (Integer skillId : idsSkillsList) {

			Skill skill = skillDao.find(skillId);

			if (skill == null) {
				return false;
			}

			Collection<Skill> skillList = projectDao.getSkillsAssociatedWithProject(projectId,
					"projectsThatHaveThisSkill");
			Collection<Project> projectsWithThisSkill = skillDao.getAssociatedProjects(skillId,
					"skillsAssociatedWithProject");

			skillList.removeIf(skillAux -> skillAux.getId() == skillId);
			projectsWithThisSkill.removeIf(projectAux -> projectAux.getId() == projectId);

			skill.setProjectsThatHaveThisSkill(projectsWithThisSkill);
			project.setSkillsAssociatedWithProject(skillList);

			projectDao.merge(project);
			skillDao.merge(skill);

		}
		return true;

	}

	// método para associar uma/várias skills a um forum
	public void associateSkillsToForum(int forumId, String idsJson) throws Exception {

		// Separar os ids de Skills
		JsonArray jArraySkill = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsSkills");
		List<Integer> idsSkillsList = new ArrayList<Integer>();

		for (int i = 0; i < jArraySkill.size(); i++) {
			idsSkillsList.add(new Gson().fromJson(jArraySkill.get(i), Integer.class));
		}

		Forum forum = forumDao.find(forumId);

		// Associar cada skill recebida àquele projeto
		for (Integer skillId : idsSkillsList) {

			// caso não encontre algo, o throws devolve esceção para o catch do controller e
			// pronto
			Skill skill = skillDao.find(skillId);

			Collection<Forum> forumsWithThisSkill = skillDao.getAssociatedForum(skillId, "skillsAssociatedWithForum");
			Collection<Skill> skillList = forumDao.getAssociatedSkills(forumId, "forumThatHaveThisSkill");

			boolean exist = false;
			for (Skill skillAux : skillList) {
				if (skillAux.getId() == skillId) {
					exist = true;
					break;
				}
			}

			if (!exist) {

				skillList.add(skill);
				forumsWithThisSkill.add(forum);

				forum.setSkillsAssociatedWithForum(skillList);
				skill.setForumThatHaveThisSkill(forumsWithThisSkill);

				forumDao.merge(forum);
				skillDao.merge(skill);
			}

		}

	}

	// método para desassociar uma skill de um forum
	public void desassociateSkillsFromForum(int forumId, String idsJson) throws Exception {

		// Separar os ids de Skills
		JsonArray jArraySkill = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsSkills");
		List<Integer> idsSkillsList = new ArrayList<Integer>();

		for (int i = 0; i < jArraySkill.size(); i++) {
			idsSkillsList.add(new Gson().fromJson(jArraySkill.get(i), Integer.class));
		}

		// desassociar cada skill recebida àquele projeto
		for (Integer skillId : idsSkillsList) {

			// caso não encontre algo, o throws devolve esceção para o catch do controller e
			// pronto
			Skill skill = skillDao.find(skillId);

			Forum forum = forumDao.find(forumId);

			Collection<Forum> forumsWithThisSkill = skillDao.getAssociatedForum(skillId, "skillsAssociatedWithForum");
			Collection<Skill> skillList = forumDao.getAssociatedSkills(forumId, "forumThatHaveThisSkill");

			forumsWithThisSkill.removeIf(forumAux -> forumAux.getId() == forumId);
			skillList.removeIf(skillAux -> skillAux.getId() == skillId);

			forum.setSkillsAssociatedWithForum(skillList);
			skill.setForumThatHaveThisSkill(forumsWithThisSkill);

			forumDao.merge(forum);
			skillDao.merge(skill);

		}

	}

	public Collection<DTOSkill> searchSkillsBySearchKey(String searchKey) throws Exception {

		Collection<Skill> skills = skillDao.searchSkillBySearchKey(searchKey);
		Collection<DTOSkill> skillsDto = new ArrayList<DTOSkill>();

		for (Skill skill : skills) {
			DTOSkill skillDto = skillDao.convertEntityToDto(skill);
			skillsDto.add(skillDto);
		}
		return skillsDto;

	}

	public Collection<DTOSkill> getAllSkills() throws Exception {
		Collection<Skill> allSkills = skillDao.findAll();
		Collection<DTOSkill> allSkillsDto = new ArrayList<DTOSkill>();

		for (Skill skill : allSkills) {
			DTOSkill dto = skillDao.convertEntityToDto(skill);
			allSkillsDto.add(dto);
		}
		return allSkillsDto;
	}

	public Collection<DTOSkill> GetSkillsAssociatedWithUser(String email) {

		Collection<Skill> userSkills = userDao.getAssociatedSkills(email, "usersWhoHaveThisSkill");
		Collection<DTOSkill> allSkillsDto = new ArrayList<DTOSkill>();

		for (Skill skill : userSkills) {
			DTOSkill dto = skillDao.convertEntityToDto(skill);
			allSkillsDto.add(dto);
		}
		return allSkillsDto;

	}

	// Buscar skill pelo titulo
	public DTOSkill GetSkillByTitle(String title) {
		Skill skill = skillDao.GetSkillByTitle(title);
		return skillDao.convertEntityToDto(skill);
	}

	// método para ver se o user tem autorização para fazer associações com projeto
	public boolean checkAuthorization(User user, int projectId) throws Exception {

		Collection<Member> projectMembers = projectDao.listProjectAdminsAndParticipators(projectId);
		if (user.getTypeUser().equals(UserType.ADMINISTRATOR)) {
			return true;
		}

		for (Member member : projectMembers) {
			if (member.getUser().getEmail().equals(user.getEmail())
					&& member.getMemberStatus().equals(MemberStatus.ADMINISTRATOR)) {
				return true;
			}
		}
		return false;

	}

	// método para ver se o user tem autorização para fazer associações em forum
	public boolean checkAuthorizationForum(User user, int forumId) throws Exception {

		Forum forum = forumDao.find(forumId);
		if (user.getTypeUser().equals(UserType.ADMINISTRATOR) || forum.getOwner().getEmail().equals(user.getEmail())) {
			return true;
		}
		return false;
	}
	
	//método para ver se o user tem autorização para editar o perfil
	public boolean checkAuthEditUser(User loggedUser, User userToEdit) throws Exception {
		
		if(loggedUser.getEmail().equals(userToEdit.getEmail())) {
			return true;
		}
		if(loggedUser.getTypeUser().equals(UserType.ADMINISTRATOR)) {
			return true;
		}
		return false;
	}

	public Collection<DTOSkill> GetSkillsAssociatedWithProject(int projectId) throws Exception {

		Collection<Skill> userSkills = skillDao.getAssociatedSkillsProject(projectId);
		Collection<DTOSkill> allSkillsDto = new ArrayList<DTOSkill>();

		for (Skill skill : userSkills) {
			DTOSkill dto = skillDao.convertEntityToDto(skill);
			allSkillsDto.add(dto);
		}
		return allSkillsDto;
	}

	public Collection<DTOSkill> GetSkillsAssociatedWithForum(int forumId) throws Exception {

		Collection<Skill> userSkills = skillDao.getAssociatedSkillsForum(forumId);
		Collection<DTOSkill> allSkillsDto = new ArrayList<DTOSkill>();

		for (Skill skill : userSkills) {
			DTOSkill dto = skillDao.convertEntityToDto(skill);
			allSkillsDto.add(dto);
		}
		return allSkillsDto;
	}

	public DTOSkill getById(int id) {
		Skill skill = skillDao.find(id);
		return skillDao.convertEntityToDto(skill);
	}
}
