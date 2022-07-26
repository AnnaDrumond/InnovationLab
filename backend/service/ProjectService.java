package pt.uc.dei.projfinal.service;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.enterprise.context.RequestScoped;
import javax.inject.Inject;

import org.json.JSONObject;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;

import pt.uc.dei.projfinal.dao.DAOForum;
import pt.uc.dei.projfinal.dao.DAOMember;
import pt.uc.dei.projfinal.dao.DAONotification;
import pt.uc.dei.projfinal.dao.DAOProject;
import pt.uc.dei.projfinal.dao.DAOSkill;
import pt.uc.dei.projfinal.dao.DAOUser;
import pt.uc.dei.projfinal.dto.DTOForum;
import pt.uc.dei.projfinal.dto.DTOProject;
import pt.uc.dei.projfinal.dto.DTOSkill;
import pt.uc.dei.projfinal.dto.DTOUser;
import pt.uc.dei.projfinal.entity.Forum;
import pt.uc.dei.projfinal.entity.Member;
import pt.uc.dei.projfinal.entity.Notification;
import pt.uc.dei.projfinal.entity.Member.MemberStatus;
import pt.uc.dei.projfinal.entity.Project;
import pt.uc.dei.projfinal.entity.Skill;
import pt.uc.dei.projfinal.entity.User;

@RequestScoped
public class ProjectService implements Serializable {

	private static final long serialVersionUID = 1L;

	@Inject
	DAOProject projectDao;
	@Inject
	DAOForum forumDao;
	@Inject
	DAOUser userDao;
	@Inject
	DAOMember memberDao;
	@Inject
	DAOSkill skillDao;
	@Inject
	DAONotification notificationDao;

	public ProjectService() {

	}

	// método para criar um novo projeto
	public int createProject(DTOProject projectDto, User user) throws Exception {
		Project project = projectDao.convertDtoToEntity(projectDto);
		project.setOwnerProj(user);
		project.setActive(true);
		projectDao.persist(project);

		Collection<Member> projectMembers = projectDao.listProjectMembers(project.getId());

		System.out.println(projectMembers.size());

		if (projectMembers.size() < 5) {
			Member newMember = new Member();// memberDao.convertToEntity(user, project);
			newMember.setMemberStatus(MemberStatus.ADMINISTRATOR);
			newMember.setProject(project);
			newMember.setUser(user);

			projectMembers.add(newMember);
			project.setUsersIntegratedList(projectMembers);

			System.out.println(newMember.toString());
			memberDao.persist(newMember);
			projectDao.merge(project);
			// newNotification("convite para integrar o projeto " + project.getTitle(),
			// NotificationType.INVITE, user);
		}

		// devolver pelo body da requisição o id do projeto recém-criado
		return project.getId();
	}

	// método para verificar se o utilizador registou algum projeto que se encontra
	// ativo
	/*
	 * public boolean verifyProjectActive(String email) throws Exception {
	 * Collection<Project> listRegistered = projectDao.listRegisteredProject(email);
	 * 
	 * boolean active = false;
	 * 
	 * for (Project projectAux : listRegistered) { if (projectAux.isActive() &&
	 * !projectAux.isSoftDelete()) { active = true; break; } } return active; }
	 */

	// método para verificar se o user é membro de algum projeto que se encontra
	// ativo
	public boolean verifyInvolvementInActiveProject(String email) throws Exception {
		Collection<Project> projects = projectDao.listProjectsUserIsMember(email);

		for (Project project : projects) {

			if (project.isActive() && !project.isSoftDelete()) {
				// Collection<Member> projectMembers =
				// projectDao.listProjectMembers(project.getId());
				// for(Member member:projectMembers) {
				// if(member.getUser().getEmail().equals(email)) {
				return true;
				// }
				// }
			}
		}
		return false;
	}

	// método para verificar se o user é membro de um um projeto que está ativo
	public boolean verifyMemberShipActive(int projectId, String email) throws Exception {
		Collection<Member> projectMembers = projectDao.listProjectAdminsAndParticipators(projectId);

		boolean admin = false;

		for (Member member : projectMembers) {
			if (member.getUser().getEmail().equals(email)
					&& member.getMemberStatus().equals(MemberStatus.ADMINISTRATOR)) {
				admin = true;
				break;
			}
		}
		return admin;

	}

	// método para verificar se o utilizador já se encontra envolvido de alguma
	// forma com aquele projeto
	public boolean verifyIfUserInvolvedWithProject(String email, Project project) throws Exception {
		Collection<Member> projectMembers = projectDao.listProjectMembers(project.getId());

		for (Member member : projectMembers) {
			if (member.getUser().getEmail().equals(email)) {
				return true;
			}
		}
		return false;
	}

	// método para verificar se o utilizador já se encontra envolvido de alguma
	// forma com aquele projeto
	public MemberStatus verifyStatusUserInvolvedWithProject(String email, Project project) throws Exception {
		Collection<Member> projectMembers = projectDao.listProjectMembers(project.getId());
		System.out.println("verifyStatusUserInvolvedWithProject");
		for (Member member : projectMembers) {
			//
			if (member.getUser().getEmail().equals(email)) {

				if (member.getMemberStatus().equals(MemberStatus.INVITED)) {
					return MemberStatus.INVITED;
				}

				if (member.getMemberStatus().equals(MemberStatus.SOLICITOR)) {
					return MemberStatus.SOLICITOR;
				}

			}
		}
		return MemberStatus.ADMINISTRATOR;
	}

	// método para favoritar o projeto
	public boolean addProjectToUserFavorites(User user, int projectId) throws Exception {
		Project project = projectDao.find(projectId);

		if (project.isSoftDelete()) {
			return false;
		}

		Collection<Project> userFavoritedProjects = userDao.getAssociatedProjects(user.getEmail(),
				"usersWhoHaveFavorited");
		Collection<User> usersWhoLikedProject = projectDao.getUsersAssociatedWithProject(projectId,
				"favoritedProjects");

		// prevenir a repetição do favorito
		boolean exist = false;
		for (Project proj : userFavoritedProjects) {
			if (proj.getId() == projectId) {
				exist = true;
				break;
			}
		}

		if (!exist) {

			userFavoritedProjects.add(project);
			usersWhoLikedProject.add(user);

			user.setFavoritedProjects(userFavoritedProjects);
			project.setUsersWhoHaveFavorited(usersWhoLikedProject);

			userDao.merge(user);
			projectDao.merge(project);

		}
		return true;
	}

	// método para remover o projeto dos favoritos do user
	public void removeProjectFromUserFavorites(User user, int projectId) throws Exception {

		Project project = projectDao.find(projectId);

		Collection<Project> userFavoritedProjects = userDao.getAssociatedProjects(user.getEmail(),
				"usersWhoHaveFavorited");
		Collection<User> usersWhoLikedProject = projectDao.getUsersAssociatedWithProject(projectId,
				"favoritedProjects");

		userFavoritedProjects.removeIf(projectAux -> projectAux.getId() == projectId);
		usersWhoLikedProject.removeIf(userAux -> userAux.getEmail().equals(user.getEmail()));

		user.setFavoritedProjects(userFavoritedProjects);
		project.setUsersWhoHaveFavorited(usersWhoLikedProject);

		userDao.merge(user);
		projectDao.merge(project);

	}

	// método para votar num projeto
	public boolean voteInProject(User user, int projectId) throws Exception {
		Project project = projectDao.find(projectId);

		if (project.isSoftDelete()) {
			return false;
		}

		Collection<Project> userVotedProjects = userDao.getAssociatedProjects(user.getEmail(), "usersWhoHaveVoted");
		Collection<User> usersWhoVotedProject = projectDao.getUsersAssociatedWithProject(projectId,
				"projectsUserHasVotedIn");

		// para prevenir a repetição do voto
		boolean exist = false;
		for (Project proj : userVotedProjects) {
			if (proj.getId() == projectId) {
				exist = true;
				break;
			}
		}

		if (!exist) {

			userVotedProjects.add(project);
			usersWhoVotedProject.add(user);

			user.setProjectsUserHasVotedIn(userVotedProjects);
			project.setUsersWhoHaveVoted(usersWhoVotedProject);
			;

			userDao.merge(user);
			projectDao.merge(project);

		}
		return true;
	}

	// método para remover o voto do projeto
	public void removeVoteInProject(User user, int projectId) throws Exception {
		Project project = projectDao.find(projectId);

		Collection<Project> userVotedProjects = userDao.getAssociatedProjects(user.getEmail(), "usersWhoHaveVoted");
		Collection<User> usersWhoVotedProject = projectDao.getUsersAssociatedWithProject(projectId,
				"projectsUserHasVotedIn");

		userVotedProjects.removeIf(projectAux -> projectAux.getId() == projectId);
		usersWhoVotedProject.removeIf(userAux -> userAux.getEmail().equals(user.getEmail()));

		user.setProjectsUserHasVotedIn(userVotedProjects);
		project.setUsersWhoHaveVoted(usersWhoVotedProject);

		userDao.merge(user);
		projectDao.merge(project);

	}

	// método para encontrar um projeto através do seu id
	public Project findProject(int id) throws Exception {
		return projectDao.find(id);
	}

	// método para editar o projeto
	public boolean editProject(DTOProject dto, Project project) throws Exception {
		if (project.isSoftDelete()) {
			return false;
		}
		Project projectEdited = projectDao.convertDtoToEntity(project, dto);
		projectDao.merge(projectEdited);
		return true;
	}

	// método para consultar a lista de projetos que o user favoritou
	public Collection<DTOProject> listFavoriteProject(String email) throws Exception {
		Collection<Project> userFavoritedProjects = userDao.getAssociatedProjects(email, "usersWhoHaveFavorited");
		Collection<DTOProject> userFavoriteDto = new ArrayList<>();

		for (Project project : userFavoritedProjects) {
			DTOProject dto = projectDao.convertEntityToDto(project);
			DTOUser userDto = userDao.convertEntityToDto(project.getOwnerProj());
			dto.setOwnerProj(userDto);
			dto.setVotes(projectDao.getNumberOfVotes(project.getId()));
			dto.setTotalMembers((int) projectDao.getNumberOfMembers(project.getId()));
			dto.setMemberVacancies(4 - (int) projectDao.getNumberOfMembers(project.getId()));
			userFavoriteDto.add(dto);
		}
		return userFavoriteDto;

	}

	// método para consultar a lista de projetos que o user registou
	public Collection<DTOProject> listRegisteredProjects(User user) throws Exception {
		Collection<Project> listRegistered = projectDao.listRegisteredProject(user.getEmail());
		Collection<DTOProject> listDto = new ArrayList<>();

		for (Project project : listRegistered) {
			DTOProject dto = projectDao.convertEntityToDto(project);
			DTOUser userDto = userDao.convertEntityToDto(project.getOwnerProj());
			dto.setOwnerProj(userDto);
			dto.setVotes(projectDao.getNumberOfVotes(project.getId()));
			dto.setTotalMembers((int) projectDao.getNumberOfMembers(project.getId()));
			dto.setMemberVacancies(4 - (int) projectDao.getNumberOfMembers(project.getId()));
			listDto.add(dto);
		}
		return listDto;
	}

	// método para adicionar membros ao projeto
	public boolean addMembersToProject(User user, Project project) throws Exception {
		// Project project = projectDao.find(projectId);
		System.out.println("addMembersToProject - service");
		Collection<Member> projectMembers = projectDao.listProjectMembers(project.getId());

		

		int count = 0;
		for (Member member : projectMembers) {
			if (member.getMemberStatus().equals(MemberStatus.ADMINISTRATOR)
					|| member.getMemberStatus().equals(MemberStatus.PARTICIPATOR)) {
				count++;
			}
		}

		System.out.println("total de membros " + count);
		if (count < 5) {
			Member newMember = new Member();// memberDao.convertToEntity(user, project);
			newMember.setMemberStatus(MemberStatus.INVITED);
			newMember.setProject(project);
			newMember.setUser(user);

			projectMembers.add(newMember);
			project.setUsersIntegratedList(projectMembers);

			System.out.println(newMember.toString());
			memberDao.persist(newMember);
			projectDao.merge(project);
			return true;
			// newNotification("convite para integrar o projeto " + project.getTitle(),
			// NotificationType.INVITE, user);
		}
		return false;
	}

	// método para associar projeto a forum OU foruMs
	public void associateProjectAndSingleOrMultipleForums(Project project, String idsJson) throws Exception {

		// Separar os ids de forums
		List<Integer> idsForumList = idSeparator("idsForum", idsJson);

		// System.out.println(idsForumList);

		// Associar cada Forum recebido àquele projeto
		for (Integer forumId : idsForumList) {

			Forum forum = forumDao.find(forumId);
			System.out.println("heyyyy");
			Collection<Project> projectList = forumDao.getAssociatedProjects(forumId);
			Collection<Forum> forumList = projectDao.getForumsAssociatedWithProject(project.getId());

			// para prevenir a repetição
			boolean exist = false;
			for (Project proj : projectList) {
				if (proj.getId() == project.getId()) {
					exist = true;
					break;
				}
			}

			if (!exist) {

				projectList.add(project);
				forumList.add(forum);

				forum.setProjectsAssociatedWithForum(projectList);
				project.setForumAssociatedWithThisProject(forumList);

				forumDao.merge(forum);
				projectDao.merge(project);
			}
		}
	}

	// método para desassociar projeto de forum
	public boolean desassociateProjectAndForum(int projectId, String idsJson) throws Exception {
		Project project = projectDao.find(projectId);

		List<Integer> idsForumList = idSeparator("idsForum", idsJson);

		for (Integer forumId : idsForumList) {

			Forum forum = forumDao.find(forumId);
			if (forum.isSoftDelete()) {
				return false;
			}

			Collection<Project> projectList = forumDao.getAssociatedProjects(forumId);
			Collection<Forum> forumList = projectDao.getForumsAssociatedWithProject(projectId);

			projectList.removeIf(projectAux -> projectAux.getId() == projectId);
			forumList.removeIf(forumAux -> forumAux.getId() == forumId);

			forum.setProjectsAssociatedWithForum(projectList);
			project.setForumAssociatedWithThisProject(forumList);

			forumDao.merge(forum);
			projectDao.merge(project);

		}
		return true;
	}

	// método para remover membros ao projeto
	public boolean removeMembersToProject(User userToRemove, User loggedUser, int projectId) throws Exception {
		Project project = projectDao.find(projectId);
		Collection<Member> projectMembers = projectDao.listProjectMembers(projectId);

		System.out.println(projectMembers.size());

		boolean isMyself = false;

		Member memberToRemove = memberDao.findMember(userToRemove.getEmail(), projectId);

		if (memberToRemove.getUser().getEmail().equals(loggedUser.getEmail())) {
			isMyself = true;
		}

		// verificar se o projeto tem pelo menos um administrador
		int count = 0;
		for (Member member : projectMembers) {
			if (member.getMemberStatus().equals(MemberStatus.ADMINISTRATOR)) {
				count++;
			}
		}

		if (count > 1 && isMyself || !isMyself) {
			projectMembers.removeIf(member -> member.getUser().getEmail().equals(userToRemove.getEmail()));

			System.out.println(projectMembers.size());

			project.setUsersIntegratedList(projectMembers);

			projectDao.merge(project);

			System.out.println("after merge");
			memberDao.remove(memberToRemove);
			System.out.println("after remove");
			return true;
		}

		return false;

	}

	// método para tornar o projeto concluído
	public void finishProject(int projectId) throws Exception {
		Project project = projectDao.find(projectId);
		project.setActive(false);
		projectDao.merge(project);
	}

	// método para listar as skills associadas ao projeto
	public Collection<DTOSkill> listAssociatedSkills(int projectId) throws Exception {
		Collection<Skill> skillList = projectDao.getSkillsAssociatedWithProject(projectId, "projectsThatHaveThisSkill");
		Collection<DTOSkill> dtoList = new ArrayList<>();

		for (Skill skill : skillList) {
			DTOSkill dto = skillDao.convertEntityToDto(skill);
			dtoList.add(dto);
		}

		return dtoList;
	}

	// método para promover o participante do projeto a administrador
	public void promoteUserToProjectAdmin(User user, int projectId) throws Exception {
		Collection<Member> projectMembers = projectDao.listProjectMembers(projectId);

		for (Member member : projectMembers) {
			if (member.getUser().getEmail().equals(user.getEmail())
					&& member.getMemberStatus().equals(MemberStatus.PARTICIPATOR)) {
				member.setMemberStatus(MemberStatus.ADMINISTRATOR);
				memberDao.merge(member);
			}
		}
	}

	// método para promover o participante do projeto a administrador
	public boolean promoteUserToProjectParticipant(User user, int projectId) throws Exception {
		Collection<Member> projectMembers = projectDao.listProjectMembers(projectId);

		for (Member member : projectMembers) {
			if (member.getUser().getEmail().equals(user.getEmail())
					&& member.getMemberStatus().equals(MemberStatus.SOLICITOR)) {
				member.setMemberStatus(MemberStatus.PARTICIPATOR);
				memberDao.merge(member);
				return true;
			}
		}
		return false;
	}

	// método para promover o participante do projeto a administrador
	public boolean dispromoteUserToProjectParticipant(User user, int projectId) throws Exception {
		Collection<Member> projectMembers = projectDao.listProjectMembers(projectId);

		int count = 0;
		for (Member member : projectMembers) {
			if (member.getMemberStatus().equals(MemberStatus.ADMINISTRATOR)) {
				count++;
			}
		}

		if (count > 1) {

			for (Member member : projectMembers) {
				if (member.getUser().getEmail().equals(user.getEmail())
						&& member.getMemberStatus().equals(MemberStatus.ADMINISTRATOR)) {
					member.setMemberStatus(MemberStatus.PARTICIPATOR);
					memberDao.merge(member);
					return true;
				}
			}
		}
		return false;

	}

	// método para o utilizador solicitar participação no projeto
	public void solicitParticipationInProject(User user, Project project) throws Exception {
		Collection<Member> projectMembers = projectDao.listProjectAdminsAndParticipators(project.getId());
		if (projectMembers.size() < 4) {
			boolean exist = false;
			for (Member member : projectMembers) {
				if (member.getUser().getEmail().equals(user.getEmail())) {
					exist = true;
					break;
				}
			}

			if (!exist) {
				// Project project = projectDao.find(projectId);
				Member member = memberDao.convertToEntity(user, project);
				member.setMemberStatus(MemberStatus.SOLICITOR);
				projectMembers.add(member);
				project.setUsersIntegratedList(projectMembers);

				memberDao.persist(member);
				projectDao.merge(project);
			}
		}
	}

	// método para o utilizador recusar participação no projeto
	public void refuseParticipationInProject(User user, int projectId) throws Exception {
		Collection<Member> projectMembers = projectDao.listProjectMembers(projectId);
		Member member = memberDao.findMember(user.getEmail(), projectId);
		Project project = projectDao.find(projectId);

		projectMembers.removeIf(memberAux -> memberAux.getUser().getEmail().equals(user.getEmail()));

		project.setUsersIntegratedList(projectMembers);

		memberDao.remove(member);
		projectDao.merge(project);

		/*
		 * Notification notification = notificationDao.getNotification(user.getEmail(),
		 * user.getEmail(), projectId); if (notification != null) {
		 * notificationDao.remove(notification); }
		 */
	}

	// método para listar todos os projetos
	public Collection<DTOProject> listAllProjects() throws Exception {
		Collection<Project> allProjects = projectDao.listAllProjects();
		Collection<DTOProject> dtoList = new ArrayList<>();

		for (Project project : allProjects) {
			DTOProject dto = projectDao.convertEntityToDto(project);
			DTOUser userDto = userDao.convertEntityToDto(project.getOwnerProj());
			dto.setOwnerProj(userDto);
			dto.setVotes(projectDao.getNumberOfVotes(project.getId()));
			dto.setTotalMembers((int) projectDao.getNumberOfMembers(project.getId()));
			dto.setMemberVacancies(4 - (int) projectDao.getNumberOfMembers(project.getId()));
			dtoList.add(dto);
		}
		return dtoList;
	}

	// método para filtrar todos os projetos com aquela skill
	public List<DTOProject> filterProjectsBySkillAndOrForum(String IdList) throws Exception {

		// Separar os ids de Skills
		List<Integer> idsSkillsList = idSeparator("idsSkills", IdList);
		// Separar os ids de forums
		List<Integer> idsForumList = idSeparator("idsForum", IdList);

		List<Project> allProjects = new ArrayList<>();
		List<Project> projectFinalList = new ArrayList<>();

		int sizeSkills = idsSkillsList.size();
		int sizeForum = idsForumList.size();

		if (sizeSkills == 1 && sizeForum == 0) {

			allProjects = projectDao.getProjectsWithSkill(idsSkillsList.get(0));
			projectFinalList.addAll(allProjects);

		} else if (sizeSkills > 1 && sizeForum == 0) {

			allProjects = projectDao.getProjectsWithSkill(idsSkillsList);
			projectFinalList = generatorProjectFinalList(allProjects, sizeSkills);

		} else if (sizeSkills == 0 && sizeForum == 1) {

			allProjects = projectDao.filterProjectsByForum(idsForumList.get(0));
			projectFinalList.addAll(allProjects);

		} else if (sizeSkills == 0 && sizeForum > 1) {

			allProjects = projectDao.filterProjectsByForum(idsForumList);
			projectFinalList = generatorProjectFinalList(allProjects, sizeForum);

		} else if (sizeSkills == 1 && sizeForum == 1) {

			allProjects = projectDao.filterProjectsByOneSkillAndOneForum(idsSkillsList.get(0), idsForumList.get(0));
			projectFinalList.addAll(allProjects);

		} else if (sizeSkills == 1 && sizeForum > 1) {

			allProjects = projectDao.filterProjectsByOneSkillAndManyForum(idsSkillsList.get(0), idsForumList);
			projectFinalList = generatorProjectFinalList(allProjects, sizeForum);

		} else if (sizeSkills > 1 && sizeForum == 1) {

			allProjects = projectDao.filterProjectsByOneForumAndManySkills(idsForumList.get(0), idsSkillsList);
			projectFinalList = generatorProjectFinalList(allProjects, sizeSkills);

		} else if (sizeSkills > 1 && sizeForum > 1) {

			allProjects = projectDao.filterProjectsByManySkillsAndForums(idsSkillsList, idsForumList);
			projectFinalList = generatorProjectFinalList(allProjects, sizeForum + sizeSkills);

		}

		System.out.println(projectFinalList);

		List<DTOProject> dtoList = new ArrayList<>();

		for (Project project : projectFinalList) {
			DTOProject dto = projectDao.convertEntityToDto(project);
			DTOUser userDto = userDao.convertEntityToDto(project.getOwnerProj());
			dto.setOwnerProj(userDto);
			dto.setVotes(projectDao.getNumberOfVotes(project.getId()));
			dto.setMemberVacancies(4 - projectDao.listProjectMembers(project.getId()).size());
			dto.setTotalMembers((int) projectDao.getNumberOfMembers(project.getId()));
			dtoList.add(dto);
		}
		return dtoList;
	}

	// método para obter a lista de forums associados àquele projeto
	public Collection<DTOForum> listForumsAssociatedWithProject(int projectId) throws Exception {
		Collection<Forum> forumList = projectDao.getForumsAssociatedWithProject(projectId);
		Collection<DTOForum> dtoList = new ArrayList<>();

		for (Forum forum : forumList) {
			DTOForum dto = forumDao.convertEntityToDto(forum);
			DTOUser userDto = userDao.convertEntityToDto(forum.getOwner());
			dto.setUserOwner(userDto);
			dto.setTotalVotes(Integer.parseInt(String.valueOf(forumDao.searchTotalVotes(forum.getId()))));
			dtoList.add(dto);
		}
		return dtoList;
	}

	public DTOProject getProjectById(int idProject, User loggedUser) throws Exception {

		Project project = projectDao.find(idProject);
		DTOProject dto = projectDao.convertEntityToDto(project);

		if (project.isSoftDelete()) {
			return null;
		}

		// Para no front termos a informação se este Projeto foi favoritado pelo user:
		// obter lista de forums que este user favoritou
		Collection<Project> favorites = projectDao.getProjectsThatUserFavorited(loggedUser.getEmail());
		for (Project favorite : favorites) {
			if (favorite.getId() == project.getId()) {
				dto.setFavorited(true);
			}
		}

		Collection<Project> votedList = projectDao.getProjectsThatUserVoted(loggedUser.getEmail());
		for (Project voted : votedList) {
			if (voted.getId() == project.getId()) {
				dto.setVoted(true);
			}
		}

		DTOUser userDto = userDao.convertEntityToDto(project.getOwnerProj());
		dto.setOwnerProj(userDto);

		// Pegar numero de votos
		dto.setVotes(projectDao.getNumberOfVotes(project.getId()));
		// Pegar quantidade de vagas disponíveis
		dto.setMemberVacancies(4 - (int) projectDao.getNumberOfMembers(project.getId()));
		// Pegar total de membros
		dto.setTotalMembers((int) projectDao.getNumberOfMembers(idProject));
		return dto;
	}

	// método para obter a lista de membros de um determinado projeto
	public Collection<DTOUser> getMembersFromProject(int projectId) throws Exception {
		Collection<Member> projectMembers = projectDao.listProjectAdminsAndParticipators(projectId);
		Collection<DTOUser> dtoList = new ArrayList<>();

		for (Member member : projectMembers) {
			DTOUser dto = userDao.convertEntityToDto(member.getUser());
			dtoList.add(dto);
		}
		return dtoList;
	}

	public Collection<DTOProject> listProjectsUserIsMember(String emailUserPersonalArea) throws Exception {

		System.out.println("entrei no service " + emailUserPersonalArea);

		Collection<Project> projects = projectDao.listProjectsUserIsMember(emailUserPersonalArea);
		System.out.println("voltei do Dao");
		System.out.println(projects);
		Collection<DTOProject> dtoList = new ArrayList<>();

		// garantir que o primeiro da lista seja o active true
		for (Project project : projects) {
			if (project.isActive()) {
				dtoList.add(listProjectsUserIsMemberSupport(project));
			}
		}

		// Depois que oa ctive já está na lista, entram os demais
		for (Project project : projects) {
			if (!project.isActive()) {
				dtoList.add(listProjectsUserIsMemberSupport(project));
			}
		}
		return dtoList;
	}

	// método para obter o projeto ativo daquele user
	public JSONObject activeProjectUserIsMember(String email) throws Exception {
		Project project = projectDao.activeProjectUserIsMember(email);

		JSONObject obj = new JSONObject();
		obj.put("id", project.getId());
		return obj;

	}

	public DTOProject listProjectsUserIsMemberSupport(Project project) throws Exception {
		DTOProject dto = projectDao.convertEntityToDto(project);
		DTOUser userDto = userDao.convertEntityToDto(project.getOwnerProj());
		dto.setOwnerProj(userDto);
		dto.setVotes(projectDao.getNumberOfVotes(project.getId()));
		dto.setMemberVacancies(4 - (int) projectDao.getNumberOfMembers(project.getId()));
		dto.setTotalMembers((int) projectDao.getNumberOfMembers(project.getId()));
		return dto;
	}

	/*
	 * public Collection<DTOProject> listProjectsUserIsMemberFilterBySkill(String
	 * emailUserPersonalArea, int idSkill) throws Exception {
	 * 
	 * System.out.println("entrei no service " + emailUserPersonalArea);
	 * 
	 * Collection<Project> projects =
	 * projectDao.listProjectsUserIsMemberFilterBySkill(emailUserPersonalArea,
	 * idSkill); System.out.println("voltei do Dao"); System.out.println(projects);
	 * Collection<DTOProject> dtoList = new ArrayList<>();
	 * 
	 * for (Project project : projects) { DTOProject dto =
	 * projectDao.convertEntityToDto(project); DTOUser userDto =
	 * userDao.convertEntityToDto(project.getOwnerProj());
	 * dto.setOwnerProj(userDto);
	 * dto.setVotes(projectDao.getNumberOfVotes(project.getId()));
	 * dto.setMemberVacancies(4 - (int)
	 * projectDao.getNumberOfMembers(project.getId())); dto.setTotalMembers((int)
	 * projectDao.getNumberOfMembers(project.getId())); dtoList.add(dto); } return
	 * dtoList; }
	 */

	public Collection<DTOProject> listProjectsUserIsMemberFilter(String emailUserPersonalArea, int idForum)
			throws Exception {

		System.out.println("entrei no service " + emailUserPersonalArea);

		Collection<Project> projects = projectDao.listProjectsUserIsMemberFilterByForum(emailUserPersonalArea, idForum);
		System.out.println("voltei do Dao");
		System.out.println(projects);
		Collection<DTOProject> dtoList = new ArrayList<>();

		for (Project project : projects) {
			DTOProject dto = projectDao.convertEntityToDto(project);
			DTOUser userDto = userDao.convertEntityToDto(project.getOwnerProj());
			dto.setOwnerProj(userDto);
			dto.setVotes(projectDao.getNumberOfVotes(project.getId()));
			dto.setMemberVacancies(4 - (int) projectDao.getNumberOfMembers(project.getId()));
			dto.setTotalMembers((int) projectDao.getNumberOfMembers(project.getId()));
			dtoList.add(dto);
		}
		return dtoList;

	}

	// Buscar o projeto mais recente que um determinaod user criou
	public DTOProject getLatestProjectUser(String email) throws Exception {
		Project project = projectDao.getLatestProjectUser(email);
		DTOProject dto = projectDao.convertEntityToDto(project);
		DTOUser userDto = userDao.convertEntityToDto(project.getOwnerProj());
		dto.setOwnerProj(userDto);
		return dto;
	}

	public void deleteProject(int projectId) throws Exception {

		Project project = projectDao.find(projectId);

		project.setSoftDelete(true);
		project.setActive(false);
		projectDao.merge(project);
	}

	// listar projetos em que um user está envolvido , por skills associadas
	public Collection<DTOProject> listFilteredEnvolvedProjects(User userToView, String idsJson) throws Exception {

		// idSeparator(String key, String idsJson)
		List<Integer> idsSkillsList = idSeparator("idsSkills", idsJson);
		List<Project> projectList = new ArrayList<>();

		// System.out.println(idsSkillsList.size());
		if (idsSkillsList.size() == 1) {
			projectList = projectDao.listProjectsUserIsMemberFilterBySkill(userToView.getEmail(), idsSkillsList.get(0));
		} else {
			projectList = projectDao.listProjectsUserIsMemberFilterByMultiplesSkills(userToView.getEmail(),
					idsSkillsList);

			int count = 0;
			for (int j = 0; j < projectList.size(); j++) {
				// System.out.println(count + " count");
				Collection<Skill> skillsList = skillDao.getAssociatedSkillsProject(projectList.get(j).getId());
				for (Skill skill : skillsList) {
					for (int i = 0; i < idsSkillsList.size(); i++) {
						if (skill.getId() == idsSkillsList.get(i)) {
							count++;
							// System.out.println("estou na condição das skills");
						}
					}
				}
				// System.out.println(j + " ++++++++++++++++++++++++++");
				if (count != idsSkillsList.size()) {
					// System.out.println("tamanho diferente");
					projectList.remove(j);
					j--;
				}
				count = 0;
				// System.out.println(j + " jjjjjj");

			}

		}
		System.out.println(projectList);
		Collection<DTOProject> dtoList = new ArrayList<>();

		for (Project project : projectList) {
			DTOProject dto = projectDao.convertEntityToDto(project);
			DTOUser userDto = userDao.convertEntityToDto(project.getOwnerProj());
			dto.setOwnerProj(userDto);
			dto.setVotes(projectDao.getNumberOfVotes(project.getId()));
			dto.setMemberVacancies(4 - (int) projectDao.getNumberOfMembers(project.getId()));
			dto.setTotalMembers((int) projectDao.getNumberOfMembers(project.getId()));
			dtoList.add(dto);
		}

		return dtoList;
	}

	// METODO AUXILIAR
	public List<Project> generatorProjectFinalList(List<Project> projectsToAdd, int sizeIdsList) throws Exception {

		System.out.println("generatorUsersFinalList sizeIdsList" + sizeIdsList);

		List<Project> projectFinalList = new ArrayList<Project>();

		int counter = 1;
		// ver quem aparece a mesma qtde de vezes do que a quantidade de ids que
		// estou buscando, pois esta pessoa teria tudo da busca

		for (int i = 0; i < projectsToAdd.size(); i++) {

			for (int j = i + 1; j < projectsToAdd.size(); j++) {
				// System.out.println("size 2 for " + usersToAdd.size());
				// System.out.print(" i: " + i + " - J: " + j);
				if (projectsToAdd.get(i).getId() == projectsToAdd.get(j).getId()) {
					counter++;
				}
				// System.out.println();
			} // fim for j

			System.out.println("emailsCounter " + counter);

			if (counter == sizeIdsList) {

				System.out.println("emailsCounter == sizeIdsList");
				System.out.println(projectsToAdd.get(i));
				projectFinalList.add(projectsToAdd.get(i));
			}

			counter = 1;

		} // fim for i

		return projectFinalList;
	}

	public List<Integer> idSeparator(String key, String idsJson) {

		JsonArray jArraySkill = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray(key);
		List<Integer> idsList = new ArrayList<Integer>();

		for (int i = 0; i < jArraySkill.size(); i++) {

			idsList.add(new Gson().fromJson(jArraySkill.get(i), Integer.class));
		}
		return idsList;
	}

	public List<DTOUser> getListAvailableUsers(String searchKey) {

		System.out.println("getListAvailableUsers - service");
		List<User> users = userDao.searchForUserByNameOrNickname(searchKey);
		List<Member> members = memberDao.getAvailableUsers();
		// Esta lista está trazendo todos até quem é invited/solicitor
		// Ver com Joana se isso impacta em algum outro sitio
		System.out.println("getAvailableUsers trouxe a lista " + members);

		// Aqui está tirando até quem é invited ou solicitor
		// Basta
		for (Member member : members) {
			// if (member.getMemberStatus().equals(MemberStatus.ADMINISTRATOR)
			// || member.getMemberStatus().equals(MemberStatus.PARTICIPATOR)) {
			users.removeIf(user -> user.getEmail().equals(member.getUser().getEmail()));
			// }

		}

		System.out.println("limpei a lista e tenho a lista final " + users);

		List<DTOUser> dtoList = new ArrayList<>();
		for (User user : users) {
			System.out.println("estou no for");
			DTOUser dto = userDao.convertEntityToDto(user);
			dtoList.add(dto);
		}

		return dtoList;
	}

	public Collection<DTOUser> getMembersFromProjectAccordingToType(int projectId, String type) throws Exception {

		MemberStatus status = null;
		switch (type) {
		case "ADMINISTRATOR":
			status = MemberStatus.ADMINISTRATOR;
			break;
		case "PARTICIPATOR":
			status = MemberStatus.PARTICIPATOR;
			break;
		case "INVITED":
			status = MemberStatus.INVITED;
			break;
		case "SOLICITOR":
			status = MemberStatus.SOLICITOR;
			break;
		default:
			status = null;
			break;
		}

		List<Member> members = memberDao.getMembersAccordingToType(projectId, status);
		List<DTOUser> dtoList = new ArrayList<>();
		for (Member user : members) {
			DTOUser dto = userDao.convertEntityToDto(user.getUser());
			dtoList.add(dto);
		}

		return dtoList;

	}

	public List<DTOSkill> listAllSkillsOfProject(int projectId) throws Exception {

		Collection<Skill> skillList = projectDao.getSkillsAssociatedWithProject(projectId, "projectsThatHaveThisSkill");

		List<DTOSkill> dtoList = new ArrayList<>();

		for (Skill skill : skillList) {
			DTOSkill dto = skillDao.convertEntityToDto(skill);
			dtoList.add(dto);
		}

		return dtoList;

	}

	public List<DTOSkill> searchSkillsByProjectUser(String emailUserPersonalArea, String searchKey) throws Exception {

		List<Skill> skillList = projectDao.searchSkillsByProjectUser(emailUserPersonalArea, searchKey);
		List<DTOSkill> dtoList = new ArrayList<>();

		for (Skill skill : skillList) {
			DTOSkill dto = skillDao.convertEntityToDto(skill);
			dtoList.add(dto);
		}
		return dtoList;
	}

	public List<DTOProject> listProjectsUserIsMemberFilterBySkill(String emailUserPersonalArea, String idsJson) {
		// Separar os ids de Skills
		JsonArray jArraySkill = new Gson().fromJson(idsJson, JsonObject.class).getAsJsonArray("idsSkills");
		List<Integer> idsSkillsList = new ArrayList<Integer>();

		for (int i = 0; i < jArraySkill.size(); i++) {
			idsSkillsList.add(new Gson().fromJson(jArraySkill.get(i), Integer.class));
		}

		// System.out.println(idsSkillsList);
		List<Project> listFoundBD = null;
		List<Project> finalList = new ArrayList<Project>();
		// Auxiliares
		int skillsSize = idsSkillsList.size();

		/////////////////////////////////////////////////////////////////////////////////////////////////////////////
		// filtrar somente por UMA skill
		if (skillsSize == 1) {
			System.out.println("skillsSize == 1");
			listFoundBD = projectDao.listProjectsUserIsMemberFilterBySkill(emailUserPersonalArea, idsSkillsList.get(0));
			System.out.println("voltei do dado com a lista " + listFoundBD);
			finalList.addAll(listFoundBD);
			/////////////////////////////////////////////////////////////////////////////////////////////////////////////
			// filtrar somente por várias skills
		} else if (skillsSize > 1) {
			System.out.println("skillsSize > 1");
			listFoundBD = projectDao.listProjectsUserIsMemberFilterByMultiplesSkills(emailUserPersonalArea,
					idsSkillsList);
			System.out.println("voltei do dado com a lista " + listFoundBD);
			finalList = generatorFinalList(listFoundBD, skillsSize);
			System.out.println("voltei de generatorForumsFinalList " + finalList);

		}

		List<DTOProject> dtoList = new ArrayList<DTOProject>();
		// Ao final transformar a resposta para Dto
		for (Project project : finalList) {
			DTOProject dto = projectDao.convertEntityToDto(project);
			DTOUser userDto = userDao.convertEntityToDto(project.getOwnerProj());
			dto.setOwnerProj(userDto);
			dto.setVotes(projectDao.getNumberOfVotes(project.getId()));
			dto.setTotalMembers((int) projectDao.getNumberOfMembers(project.getId()));
			dto.setMemberVacancies(4 - (int) projectDao.getNumberOfMembers(project.getId()));
			dtoList.add(dto);

		}

		return dtoList;
	}

	private List<Project> generatorFinalList(List<Project> listFoundBD, int skillsSize) {
		//
		List<Project> finalList = new ArrayList<Project>();

		int counter = 1;

		for (int i = 0; i < listFoundBD.size(); i++) {
			for (int j = i + 1; j < listFoundBD.size(); j++) {
				if (listFoundBD.get(i).getId() == listFoundBD.get(j).getId()) {
					counter++;
				}
			} // fim for j

			if (counter == skillsSize) {
				finalList.add(listFoundBD.get(i));
			}
			counter = 1;
		} // fim for i

		return finalList;
	}

	public boolean acceptInvitation(String email, Project project) throws Exception {
		
		if(verifyInvolvementInActiveProject(email)) {
			return false;
		}

		Collection<Member> members = projectDao.listProjectMembers(project.getId());
		System.out.println("entrei em acceptInvitation - service");
		for (Member member : members) {

			if (member.getUser().getEmail().equals(email)) {

				member.setMemberStatus(MemberStatus.PARTICIPATOR);
				memberDao.merge(member);
				System.out.println("acceptInvitation servive dentro do if com a lista " + members);
				Notification notification = notificationDao.getNotification(member.getUser().getEmail(),
						member.getUser().getEmail(), project.getId());

				if (notification != null) {
					notificationDao.remove(notification);
				}
				break;
			}
		}

		return true;

		// project.setUsersIntegratedList(members);
		// projectDao.merge(project);

	}
}
