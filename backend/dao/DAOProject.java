package pt.uc.dei.projfinal.dao;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Collection;
import java.util.List;

import javax.ejb.Stateless;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

import pt.uc.dei.projfinal.dto.DTOProject;
import pt.uc.dei.projfinal.entity.Forum;
import pt.uc.dei.projfinal.entity.Forum.ForumType;
import pt.uc.dei.projfinal.entity.Interest;
import pt.uc.dei.projfinal.entity.Member;
import pt.uc.dei.projfinal.entity.Member.MemberStatus;
import pt.uc.dei.projfinal.entity.Project;
import pt.uc.dei.projfinal.entity.Skill;
import pt.uc.dei.projfinal.entity.User;

@Stateless
public class DAOProject extends AbstractDao<Project> {

	private static final long serialVersionUID = 1L;

	public DAOProject() {
		super(Project.class);
	}

	public Project convertDtoToEntity(DTOProject projectDto) {
		Project project = new Project();
		project.setTitle(projectDto.getTitle());
		project.setDescription(projectDto.getDescription());
		project.setNecessaryResources(projectDto.getNecessaryResources());
		project.setExecutionPlan(projectDto.getExecutionPlan());
		return project;
	}

	public Project convertDtoToEntity(Project project, DTOProject dto) {
		project.setTitle(dto.getTitle());
		project.setDescription(dto.getDescription());
		project.setNecessaryResources(dto.getNecessaryResources());
		project.setExecutionPlan(dto.getExecutionPlan());
		return project;
	}

	public DTOProject convertEntityToDto(Project project) {
		DTOProject dto = new DTOProject();
		dto.setDescription(project.getDescription());
		dto.setExecutionPlan(project.getExecutionPlan());
		dto.setId(project.getId());
		dto.setNecessaryResources(project.getNecessaryResources());
		dto.setTitle(project.getTitle());
		Timestamp timestamp = project.getCreationDate();
		dto.setCreationDate(new SimpleDateFormat("MM/dd/yyyy HH:mm:ss").format(timestamp));
		timestamp = project.getLastUpdate();
		dto.setLastUpdate(new SimpleDateFormat("MM/dd/yyyy HH:mm:ss").format(timestamp));
		dto.setActive(project.isActive());
		return dto;
	}

	// método para obter a lista de users que favoritaram este projeto
	public Collection<User> getUsersAssociatedWithProject(int projectId, String join) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Project> project = user.join(join);
			criteriaQuery.select(user).where(em.getCriteriaBuilder().equal(project.get("id"), projectId));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// método para obter a lista de skills associadas a este projeto
	public Collection<Skill> getSkillsAssociatedWithProject(int projectId, String join) {

		try {

			final CriteriaQuery<Skill> criteriaQuery = em.getCriteriaBuilder().createQuery(Skill.class);
			Root<Skill> skill = criteriaQuery.from(Skill.class);
			Join<Skill, Project> project = skill.join(join);
			criteriaQuery.select(skill).where(em.getCriteriaBuilder().equal(project.get("id"), projectId));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// método para obter a lista de forums associadas a este projeto
	public Collection<Forum> getForumsAssociatedWithProject(int projectId) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, Project> join = forum.join("projectsAssociatedWithForum");
			criteriaQuery.select(forum).where(
					em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(join.get("id"), projectId)),
					em.getCriteriaBuilder().equal(forum.get("softDelete"), false));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// método para obter a lista de projetos que o user registou
	public Collection<Project> listRegisteredProject(String email) {
		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> rootProject = criteriaQuery.from(Project.class);

			criteriaQuery.select(rootProject)
					.where(em.getCriteriaBuilder()
							.and(em.getCriteriaBuilder().equal(rootProject.get("ownerProj").get("email"), email)),
							em.getCriteriaBuilder().equal(rootProject.get("softDelete"), false));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// método para obter a lista de projetos que o user está envolvido e filtrado
	// por um id de skill
	public List<Project> listFilteredProjectBySingleSkill(String email, int idSkill) {
		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> rootProject = criteriaQuery.from(Project.class);

			Join<Project, Member> member = rootProject.join("usersIntegratedList");
			Join<Project, Skill> skill = rootProject.join("skillsAssociatedWithProject");

			Predicate one = em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(member.get("user").get("email"), email),
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.ADMINISTRATOR),
					em.getCriteriaBuilder().equal(rootProject.get("softDelete"), false));

			Predicate two = em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(member.get("user").get("email"), email),
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.PARTICIPATOR),
					em.getCriteriaBuilder().equal(rootProject.get("softDelete"), false));


			Predicate four = em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(skill.get("id"), idSkill),
					em.getCriteriaBuilder().equal(rootProject.get("softDelete"), false));

			criteriaQuery.select(rootProject)
					.where(em.getCriteriaBuilder().and(four, em.getCriteriaBuilder().or(one, two)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}


	// método para obter a lista de membros de um projeto
	public Collection<Member> listProjectMembers(int projectId) {
		try {

			final CriteriaQuery<Member> criteriaQuery = em.getCriteriaBuilder().createQuery(Member.class);
			Root<Member> rootMember = criteriaQuery.from(Member.class);
			Join<Member, Project> joinMember = rootMember.join("project");

			criteriaQuery.select(rootMember).where(em.getCriteriaBuilder().equal(joinMember.get("id"), projectId));

			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
	
			return null;
		}
	}

	// método para obter a lista de admins e participantes do projeto
	public Collection<Member> listProjectAdminsAndParticipators(int projectId) {
		try {

			final CriteriaQuery<Member> criteriaQuery = em.getCriteriaBuilder().createQuery(Member.class);
			Root<Member> rootMember = criteriaQuery.from(Member.class);
			Join<Member, Project> joinMember = rootMember.join("project");

			Predicate predicate = em.getCriteriaBuilder().or(
					em.getCriteriaBuilder().equal(rootMember.get("memberStatus"), MemberStatus.ADMINISTRATOR),
					em.getCriteriaBuilder().equal(rootMember.get("memberStatus"), MemberStatus.PARTICIPATOR));

			criteriaQuery.select(rootMember).where(em.getCriteriaBuilder().and(predicate,
					em.getCriteriaBuilder().equal(joinMember.get("id"), projectId)));

			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
	
			return null;
		}
	}

	// método para obter o número de votos daquele projeto
	public long getNumberOfVotes(int projectId) {
		try {

			CriteriaQuery<Long> cqCount = em.getCriteriaBuilder().createQuery(Long.class);
			CriteriaQuery<Project> cqEntity = em.getCriteriaBuilder().createQuery(Project.class);

			Root<Project> forum = cqCount.from(cqEntity.getResultType());
			Join<Project, User> user = forum.join("usersWhoHaveVoted");

			cqCount.select(em.getCriteriaBuilder().count(user))
					.where(em.getCriteriaBuilder().equal(forum.get("id"), projectId));

			return em.createQuery(cqCount).getSingleResult();

		} catch (Exception e) {
	
			return 0;
		}
	}

	// método para obter os projetos com aquela skill
	public List<Project> getProjectsWithSkill(int skillId) {
		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> rootProject = criteriaQuery.from(Project.class);
			Join<Project, Skill> joinSkill = rootProject.join("skillsAssociatedWithProject");

			criteriaQuery.select(rootProject)
					.where(em.getCriteriaBuilder().and(
							em.getCriteriaBuilder().equal(rootProject.get("softDelete"), false),
							em.getCriteriaBuilder().equal(joinSkill.get("id"), skillId)));

			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
	
			return null;
		}
	}

	// método para obter os projetos com aquela lista de skill
	public List<Project> getProjectsWithSkill(List<Integer> skillList) {
		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> rootProject = criteriaQuery.from(Project.class);
			Join<Project, Skill> joinSkill = rootProject.join("skillsAssociatedWithProject");

			Predicate predicate = em.getCriteriaBuilder().and(joinSkill.get("id").in(skillList));

			criteriaQuery.select(rootProject).where(em.getCriteriaBuilder()
					.and(em.getCriteriaBuilder().equal(rootProject.get("softDelete"), false), predicate));

			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
		
			return null;
		}
	}

	// método para obter os projetos com aquele forum associado
	public List<Project> filterProjectsByForum(int forumId) {
		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> rootProject = criteriaQuery.from(Project.class);
			Join<Project, Forum> joinForum = rootProject.join("forumAssociatedWithThisProject");

			criteriaQuery.select(rootProject)
					.where(em.getCriteriaBuilder().and(
							em.getCriteriaBuilder().equal(rootProject.get("softDelete"), false),
							em.getCriteriaBuilder().equal(joinForum.get("id"), forumId)));

			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
		
			return null;
		}
	}

	// método para obter o total de membros de um projeto
	public long getNumberOfMembers(int projectId) {
		try {

			CriteriaQuery<Long> cqCount = em.getCriteriaBuilder().createQuery(Long.class);
			CriteriaQuery<Project> cqEntity = em.getCriteriaBuilder().createQuery(Project.class);

			Root<Project> project = cqCount.from(cqEntity.getResultType());
			Join<Project, Member> user = project.join("usersIntegratedList");

			Predicate predicate = em.getCriteriaBuilder().or(
					em.getCriteriaBuilder().equal(user.get("memberStatus"), MemberStatus.ADMINISTRATOR),
					em.getCriteriaBuilder().equal(user.get("memberStatus"), MemberStatus.PARTICIPATOR));

			cqCount.select(em.getCriteriaBuilder().count(user)).where(em.getCriteriaBuilder().and(predicate,
					em.getCriteriaBuilder().equal(project.get("id"), projectId)));

			return em.createQuery(cqCount).getSingleResult();

		} catch (Exception e) {
		
			return 0;
		}
	}

	// método para devolver a lista de projetos em que o user está envolvido
	// (participa ou é administrador)
	public Collection<Project> listProjectsUserIsMember(String email) {

		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);

			Root<Project> project = criteriaQuery.from(Project.class);

			// Verificar quem na entidade Project me liga a Member
			Join<Project, Member> member = project.join("usersIntegratedList");

			Predicate one = em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(member.get("user").get("email"), email),
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.ADMINISTRATOR),
					em.getCriteriaBuilder().equal(project.get("softDelete"), false));

			Predicate two = em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(member.get("user").get("email"), email),
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.PARTICIPATOR),
					em.getCriteriaBuilder().equal(project.get("softDelete"), false));

			criteriaQuery.select(project).where(em.getCriteriaBuilder().or(one, two));

			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {

			return null;
		}
	}

	// método para trazer o projeto ativo em que o user é administrador ou
	// participante
	public Project activeProjectUserIsMember(String email) {

		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);

			Root<Project> project = criteriaQuery.from(Project.class);

			// Verificar quem na entidade Project me liga a Member
			Join<Project, Member> member = project.join("usersIntegratedList");

			Predicate one = em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(member.get("user").get("email"), email),
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.ADMINISTRATOR),
					em.getCriteriaBuilder().equal(project.get("softDelete"), false),
					em.getCriteriaBuilder().equal(project.get("active"), true));

			Predicate two = em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(member.get("user").get("email"), email),
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.PARTICIPATOR),
					em.getCriteriaBuilder().equal(project.get("softDelete"), false),
					em.getCriteriaBuilder().equal(project.get("active"), true));

			criteriaQuery.select(project).where(em.getCriteriaBuilder().or(one, two));

			return em.createQuery(criteriaQuery).getSingleResult();
		} catch (Exception e) {

			return null;
		}
	}

	// filtrar projetos em que user está envolvido por UMA skill
	public List<Project> listProjectsUserIsMemberFilterBySkill(String email, int idSkill) {
	
		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> project = criteriaQuery.from(Project.class);
			// Verificar quem na entidade Project me liga a Member
			Join<Project, Member> member = project.join("usersIntegratedList");
			Join<Project, Skill> skill = project.join("skillsAssociatedWithProject");

			criteriaQuery.distinct(true);

			Predicate one = em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(member.get("user").get("email"), email),
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.ADMINISTRATOR),
					em.getCriteriaBuilder().equal(skill.get("id"), idSkill),
					em.getCriteriaBuilder().equal(project.get("softDelete"), false));

			Predicate two = em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(member.get("user").get("email"), email),
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.PARTICIPATOR),
					em.getCriteriaBuilder().equal(skill.get("id"), idSkill),
					em.getCriteriaBuilder().equal(project.get("softDelete"), false));

			Predicate three = em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(project.get("ownerProj").get("email"), email),
					em.getCriteriaBuilder().equal(skill.get("id"), idSkill),
					em.getCriteriaBuilder().equal(project.get("softDelete"), false));

			criteriaQuery.select(project).where(em.getCriteriaBuilder().or(one, two, three));

			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {

			return null;
		}
	}
	

	// filtrar projetos em que user está envolvido por multiplas skills
	public List<Project> listProjectsUserIsMemberFilterByMultiplesSkills(String email, List<Integer> idSkillsList) {

		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);

			Root<Project> project = criteriaQuery.from(Project.class);
			// Verificar quem na entidade Project me liga a Member
			Join<Project, Member> member = project.join("usersIntegratedList");
			Join<Project, Skill> skill = project.join("skillsAssociatedWithProject");

			//criteriaQuery.distinct(true);

			Predicate one = em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(member.get("user").get("email"), email),
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.ADMINISTRATOR),
					em.getCriteriaBuilder().equal(project.get("softDelete"), false));

			Predicate two = em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(member.get("user").get("email"), email),
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.PARTICIPATOR),
					em.getCriteriaBuilder().equal(project.get("softDelete"), false));

			Predicate four = skill.get("id").in(idSkillsList);

			criteriaQuery.select(project)
					.where(em.getCriteriaBuilder().and(em.getCriteriaBuilder().or(one, two), four));

			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
			return null;
		}
	}

	// Filtrar projetos em que um determinado user esta envolvido, por ideias
	// /necessidades
	public Collection<Project> listProjectsUserIsMemberFilterByForum(String email, int idForum) {

		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);

			Root<Project> project = criteriaQuery.from(Project.class);

			// Verificar quem na entidade Project me liga a Member
			Join<Project, Member> member = project.join("usersIntegratedList");
			Join<Project, Forum> forum = project.join("forumAssociatedWithThisProject");

			criteriaQuery.distinct(true);

			Predicate one = em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(member.get("user").get("email"), email),
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.ADMINISTRATOR),
					em.getCriteriaBuilder().equal(forum.get("id"), idForum),
					em.getCriteriaBuilder().equal(project.get("softDelete"), false));

			Predicate two = em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(member.get("user").get("email"), email),
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.PARTICIPATOR),
					em.getCriteriaBuilder().equal(forum.get("id"), idForum),
					em.getCriteriaBuilder().equal(project.get("softDelete"), false));

			criteriaQuery.select(project).where(em.getCriteriaBuilder().or(one, two));

			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
			return null;
		}

	}

	// Buscar o projeto mais recente que um determinaod user criou
	public Project getLatestProjectUser(String email) {

		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> project = criteriaQuery.from(Project.class);
			Join<Project, User> user = project.join("ownerProj");
			
			criteriaQuery.orderBy(em.getCriteriaBuilder().desc(project.get("creationDate")));
			criteriaQuery.select(project).where(em.getCriteriaBuilder().equal(user.get("email"), email));
			// Pegar somente o primeiro resultado
			return em.createQuery(criteriaQuery).getResultList().get(0);
			//
		} catch (Exception e) {
			return null;
		}
	}

	// obter todos os projetos não apagados
	public Collection<Project> listAllProjects() {
		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> project = criteriaQuery.from(Project.class);
			criteriaQuery.select(project).where(em.getCriteriaBuilder().equal(project.get("softDelete"), false));
			//
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	public List<Project> filterProjectsByForum(List<Integer> idsForumList) {

		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> rootProject = criteriaQuery.from(Project.class);
			Join<Project, Forum> joinForum = rootProject.join("forumAssociatedWithThisProject");

			Predicate predicate = em.getCriteriaBuilder().and(joinForum.get("id").in(idsForumList));

			criteriaQuery.select(rootProject).where(em.getCriteriaBuilder()
					.and(em.getCriteriaBuilder().equal(rootProject.get("softDelete"), false), predicate));

			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
			return null;
		}
	}

	public List<Project> filterProjectsByOneSkillAndOneForum(int idSkill, int idForum) {

		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> rootProject = criteriaQuery.from(Project.class);
			Join<Project, Forum> joinForum = rootProject.join("forumAssociatedWithThisProject");
			Join<Project, Skill> joinSkill = rootProject.join("skillsAssociatedWithProject");

			criteriaQuery.select(rootProject)
					.where(em.getCriteriaBuilder().and(
							em.getCriteriaBuilder().equal(rootProject.get("softDelete"), false),
							em.getCriteriaBuilder().equal(joinForum.get("id"), idForum),
							em.getCriteriaBuilder().equal(joinSkill.get("id"), idSkill)));

			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
			return null;
		}

	}

	public List<Project> filterProjectsByManySkillsAndForums(List<Integer> idsSkillsList, List<Integer> idsForumList) {
		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> rootProject = criteriaQuery.from(Project.class);
			Join<Project, Forum> joinForum = rootProject.join("forumAssociatedWithThisProject");
			Join<Project, Skill> joinSkill = rootProject.join("skillsAssociatedWithProject");

			criteriaQuery.select(rootProject).where(em.getCriteriaBuilder().and(joinSkill.get("id").in(idsSkillsList),
					joinForum.get("id").in(idsForumList)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	public List<Project> filterProjectsByOneSkillAndManyForum(Integer idSkill, List<Integer> idsForumList) {
		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> rootProject = criteriaQuery.from(Project.class);
			Join<Project, Forum> joinForum = rootProject.join("forumAssociatedWithThisProject");
			Join<Project, Skill> joinSkill = rootProject.join("skillsAssociatedWithProject");

			criteriaQuery.select(rootProject).where(em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(joinSkill.get("id"), idSkill), joinForum.get("id").in(idsForumList)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	public List<Project> filterProjectsByOneForumAndManySkills(Integer idForum, List<Integer> idsSkillsList) {
		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> rootProject = criteriaQuery.from(Project.class);
			Join<Project, Forum> joinForum = rootProject.join("forumAssociatedWithThisProject");
			Join<Project, Skill> joinSkill = rootProject.join("skillsAssociatedWithProject");

			criteriaQuery.select(rootProject)
					.where(em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(joinForum.get("id"), idForum),
							joinSkill.get("id").in(idsSkillsList)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// Buscar projetos que um determinado user votou
	public Collection<Project> getProjectsThatUserVoted(String email) {
		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> project = criteriaQuery.from(Project.class);
			Join<Project, User> user = project.join("usersWhoHaveVoted");

			criteriaQuery.select(project).where(em.getCriteriaBuilder().equal(user.get("email"), email));
			// Pegar somente o primeiro resultado
			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
			return null;
		}
	}

	// Buscar projetos que um determinado user votou
	public Collection<Project> getProjectsThatUserFavorited(String email) {
		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> project = criteriaQuery.from(Project.class);
			Join<Project, User> user = project.join("usersWhoHaveFavorited");

			criteriaQuery.select(project).where(em.getCriteriaBuilder().equal(user.get("email"), email));
			// Pegar somente o primeiro resultado
			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
			return null;
		}
	}

	// busca ativa das skills associadas aos projetos em que o user está envolvido
	public List<Skill> searchSkillsByProjectUser(String email, String searchKey) {

		try {
			
			final CriteriaQuery<Skill> criteriaQuery = em.getCriteriaBuilder().createQuery(Skill.class);
			Root<Skill> skill = criteriaQuery.from(Skill.class);
			Join<Skill, Project> project = skill.join("projectsThatHaveThisSkill");
			Join<Project, Member> member = project.join("usersIntegratedList");

			Predicate predicate1 = em.getCriteriaBuilder().or(
					em.getCriteriaBuilder().like(skill.get("title"), '%' + searchKey + '%'),
					em.getCriteriaBuilder().like(skill.get("title"), '%' + searchKey),
					em.getCriteriaBuilder().like(skill.get("title"), searchKey + '%'));

			Predicate predicate2 = em.getCriteriaBuilder().equal(project.get("softDelete"), false);

			Predicate predicate3 = em.getCriteriaBuilder().equal(member.get("user").get("email"), email);

			Predicate predicate4 = em.getCriteriaBuilder().or(
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.ADMINISTRATOR),
					em.getCriteriaBuilder().equal(member.get("memberStatus"), MemberStatus.PARTICIPATOR));

			// impedir resultados repetidos
			criteriaQuery.distinct(true);
			//
			criteriaQuery.select(skill)
					.where(em.getCriteriaBuilder().and(predicate1, predicate2, predicate3, predicate4));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}
}
