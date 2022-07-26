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

import pt.uc.dei.projfinal.dto.DTOForum;
import pt.uc.dei.projfinal.entity.Association;
import pt.uc.dei.projfinal.entity.Comment;
import pt.uc.dei.projfinal.entity.Forum;
import pt.uc.dei.projfinal.entity.Forum.ForumType;
import pt.uc.dei.projfinal.entity.Interest;
import pt.uc.dei.projfinal.entity.Project;
import pt.uc.dei.projfinal.entity.Skill;
import pt.uc.dei.projfinal.entity.User;

@Stateless
public class DAOForum extends AbstractDao<Forum> {

	private static final long serialVersionUID = 1L;

	public DAOForum() {
		super(Forum.class);
	}

	public Forum convertDtoToEntity(DTOForum forumDto) {
		Forum forum = new Forum();
		forum.setForumType(forumDto.getType());
		forum.setDescription(forumDto.getDescription());
		forum.setTitle(forumDto.getTitle());
		return forum;
	}

	public Forum convertDtoToEntity(Forum forum, DTOForum dto) {

		forum.setDescription(dto.getDescription());
		forum.setTitle(dto.getTitle());
		return forum;
	}

	public DTOForum convertEntityToDto(Forum forum) {

		DTOForum dto = new DTOForum();
		dto.setType(forum.getForumType());
		dto.setDescription(forum.getDescription());
		dto.setId(forum.getId());
		Timestamp timestamp = forum.getCreationDate();
		dto.setCreationDate(new SimpleDateFormat("MM/dd/yyyy HH:mm:ss").format(timestamp));

		if (forum.getLastUpdate() != null) {
			timestamp = forum.getLastUpdate();
			dto.setLastUpDate(new SimpleDateFormat("MM/dd/yyyy HH:mm:ss").format(timestamp));
		}

		dto.setTitle(forum.getTitle());
		return dto;

	}

	/**
	 * Obtem a lista de users que favoritaram este forum
	 * 
	 * @param forumId - id da ideia/necessidade associada a ser pesquisada
	 * @param join    - parametro de união entre as tabelas
	 * @return
	 */
	public Collection<User> getUsersAssociatedWithForum(int forumId, String join) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> u = criteriaQuery.from(User.class);
			Join<User, Forum> n = u.join(join);
			criteriaQuery.select(u).where(em.getCriteriaBuilder().equal(n.get("id"), forumId));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Busca lista de Skills associadas a uma determinada ideia/necessidade
	 * 
	 * @param forumId - id da ideia/necessidade associada a ser pesquisada
	 * @param join    - parametro de união entre as tabelas
	 * @return
	 */
	public Collection<Skill> getAssociatedSkills(int forumId, String join) {
		try {
			final CriteriaQuery<Skill> criteriaQuery = em.getCriteriaBuilder().createQuery(Skill.class);
			Root<Skill> skill = criteriaQuery.from(Skill.class);
			Join<Skill, Forum> forum = skill.join(join);
			criteriaQuery.select(skill).where(em.getCriteriaBuilder().equal(forum.get("id"), forumId));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Busca projetos associados a uma ideia/necessidade
	 * 
	 * @param forumId - id da ideia/necessidade associada a ser pesquisada
	 * @return
	 */
	public Collection<Project> getAssociatedProjects(int forumId) {
		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> project = criteriaQuery.from(Project.class);
			Join<Project, Forum> forum = project.join("forumAssociatedWithThisProject");
			criteriaQuery.select(project).where(em.getCriteriaBuilder().equal(forum.get("id"), forumId));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Busca as associações entres forums
	 * 
	 * @param forumId - id da ideia/necessidade associada a ser pesquisada
	 * @param join    - parametro de união entre as tabelas
	 * @return
	 */
	public Collection<Association> getAssociatedForums(int id, String join) {
		try {
			final CriteriaQuery<Association> criteriaQuery = em.getCriteriaBuilder().createQuery(Association.class);
			Root<Association> association = criteriaQuery.from(Association.class);
			Join<Association, Forum> forum = association.join(join);
			criteriaQuery.select(association).where(em.getCriteriaBuilder().equal(forum.get("id"), id));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Busca a lista de forum que o user registou
	 * 
	 * @param email - email do utilizador a ser pesquisado
	 * @return
	 */
	public Collection<Forum> listRegisteredForum(String email) {
		
	

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> rootForum = criteriaQuery.from(Forum.class);

			criteriaQuery.select(rootForum)
					.where(em.getCriteriaBuilder()
							.and(em.getCriteriaBuilder().equal(rootForum.get("owner").get("email"), email)),
							em.getCriteriaBuilder().equal(rootForum.get("softDelete"), false));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			System.out.println("catch -  dao");
			return null;
		}
	}

	/**
	 * Obtem a lista de todas as ideias e necessidades com softDelete a false
	 * 
	 * @return
	 */
	public Collection<Forum> listNonDeletedForum() {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> rootForum = criteriaQuery.from(Forum.class);
			criteriaQuery.select(rootForum).where(em.getCriteriaBuilder().equal(rootForum.get("softDelete"), false));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {

			return null;
		}

	}

	/**
	 * Busca a lista de necessidades ou ideias que o user registou
	 * 
	 * @param email - email do utilizador a ser pesquisado
	 * @param type  - categoria a ser pesquisada(ideia ou necessidade)
	 * @return
	 */
	public Collection<Forum> listRegisteredIdeasOrNecessities(String email, ForumType type) {
		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> rootForum = criteriaQuery.from(Forum.class);

			criteriaQuery.select(rootForum)
					.where(em.getCriteriaBuilder()
							.and(em.getCriteriaBuilder().equal(rootForum.get("owner").get("email"), email)),
							em.getCriteriaBuilder().equal(rootForum.get("forumType"), type),
							em.getCriteriaBuilder().equal(rootForum.get("softDelete"), false));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Busca interesses associados a este forum
	 * 
	 * @param forumId - id da ideia/necessidade associada a ser pesquisada
	 * @param join    - parametro de união entre as tabelas
	 * @return
	 */
	public Collection<Interest> getInterestsAssociatedWithForum(int forumId, String join) {
		try {

			final CriteriaQuery<Interest> criteriaQuery = em.getCriteriaBuilder().createQuery(Interest.class);
			Root<Interest> rootForum = criteriaQuery.from(Interest.class);
			Join<Interest, Forum> interestJoin = rootForum.join(join);
			criteriaQuery.select(rootForum).where(em.getCriteriaBuilder().equal(interestJoin.get("id"), forumId));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Busca a quantidade de votos (users que votaram) de uma certa
	 * ideia/necessidade
	 * 
	 * @param idForum - id da ideia/necessidade associada a ser pesquisada
	 * @return
	 */
	public long searchTotalVotes(int idForum) {
		
		try {

			CriteriaQuery<Long> cqCount = em.getCriteriaBuilder().createQuery(Long.class);
			CriteriaQuery<Forum> cqEntity = em.getCriteriaBuilder().createQuery(Forum.class);

			Root<Forum> forum = cqCount.from(cqEntity.getResultType());
			Join<Forum, User> user = forum.join("usersWhoHaveVoted");

			cqCount.select(em.getCriteriaBuilder().count(user))
					.where(em.getCriteriaBuilder().equal(forum.get("id"), idForum));

			return em.createQuery(cqCount).getSingleResult();

		} catch (Exception e) {
			e.printStackTrace();
			return 0;
		}
	}

	/**
	 * Método para filtrar/buscar todo os forums do tipo IDEA
	 * 
	 * @param type - categoria a ser pesquisada (ideia/necessidade)
	 * @return
	 */
	public Collection<Forum> getForumsByidea(ForumType type) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> rootForum = criteriaQuery.from(Forum.class);

			criteriaQuery.select(rootForum).where(
					em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(rootForum.get("softDelete"), false)),
					em.getCriteriaBuilder().equal(rootForum.get("forumType"), type));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Buscar lista de users que indicaram ter disponibilidade para trabalhar em
	 * determinado forum (ideia/necessidade)
	 * 
	 * @param forumId - id da ideia/necessidade associada a ser pesquisada
	 * @return
	 */
	public Collection<User> getUsersWhoHaveInterest(int forumId) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Forum> forum = user.join("forumsUserWishesToWorkIn");

			criteriaQuery.select(user).where(em.getCriteriaBuilder().equal(forum.get("id"), forumId));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Filtra forum(ideia/necessidade) somente por um unico interesse
	 * 
	 * @param idInterest
	 * @return
	 */
	public List<Forum> filterForumByInterestId(int idInterest) {
		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, Interest> interest = forum.join("interestsAssociatedWithForum");
			criteriaQuery.select(forum).where(em.getCriteriaBuilder().equal(interest.get("id"), idInterest));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Filtra forum(ideia/necessidade) somente por uma unica skill
	 * 
	 * @param idSkill
	 * @return
	 */
	public List<Forum> filterForumBySkillId(int idSkill) {
		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, Skill> skill = forum.join("skillsAssociatedWithForum");
			criteriaQuery.select(forum).where(em.getCriteriaBuilder().equal(skill.get("id"), idSkill));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Filtra forum(ideia/necessidade) por uma unica skill & um unico interesse
	 * 
	 * @param idSkill
	 * @param idInterest
	 * @return
	 */
	public List<Forum> filterForumBySkillIdAndInterestId(int idSkill, int idInterest) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, Skill> skill = forum.join("skillsAssociatedWithForum");
			Join<Forum, Interest> interest = forum.join("interestsAssociatedWithForum");

			Predicate predicateSkill = em.getCriteriaBuilder().equal(skill.get("id"), idSkill);
			Predicate predicateInterest = em.getCriteriaBuilder().equal(interest.get("id"), idInterest);

			criteriaQuery.where(em.getCriteriaBuilder().and(predicateSkill, predicateInterest));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Método para listar todos os interesses associados a um determinado forum
	 * registado por um user
	 * 
	 * @param email - email do user que registou os interesses a serem pesquisados
	 * @return
	 */
	public List<Interest> listAllInterestsByForumUser(String email) {

		try {

			final CriteriaQuery<Interest> criteriaQuery = em.getCriteriaBuilder().createQuery(Interest.class);
			Root<Interest> interest = criteriaQuery.from(Interest.class);
			Join<Interest, Forum> forum = interest.join("forumThatHaveThisInterest");
			Join<Forum, User> user = forum.join("owner");

			criteriaQuery.distinct(true);// impedir resultados repetidos
			criteriaQuery.select(interest).where(
					em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("email"), email)),
					em.getCriteriaBuilder().equal(forum.get("softDelete"), false));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Busca ativa dos interesses associados as ideias/necessidades registadas por
	 * um user
	 * 
	 * @param email     - email do user que registou os interesses a serem
	 *                  pesquisados
	 * @param searchkey - letra ou palavra digitada pelo user como criterio de busca
	 * @param type      - categoria a ser pesquisada (ideia/necessidade)
	 * @return
	 */
	public List<Interest> searchInterestsByForumUser(String email, String searchkey, ForumType type) {

		System.out.println("dao para buscar os interesses");

		try {

			final CriteriaQuery<Interest> criteriaQuery = em.getCriteriaBuilder().createQuery(Interest.class);
			Root<Interest> interest = criteriaQuery.from(Interest.class);
			Join<Interest, Forum> forum = interest.join("forumThatHaveThisInterest");
			Join<Forum, User> user = forum.join("owner");

			// impedir resultados repetidos
			criteriaQuery.distinct(true);
			criteriaQuery.select(interest).where(
					// ou
					em.getCriteriaBuilder().or(
							em.getCriteriaBuilder().like(interest.get("title"), '%' + searchkey + '%'),
							em.getCriteriaBuilder().like(interest.get("title"), '%' + searchkey),
							em.getCriteriaBuilder().like(interest.get("title"), searchkey + '%')),
					// e
					em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("email"), email)),
					em.getCriteriaBuilder().equal(forum.get("softDelete"), false),
					em.getCriteriaBuilder().equal(forum.get("forumType"), type));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Lista todas as skills associadas a uma determinada ideia/necessidade
	 * registada por um user
	 * 
	 * @param email - email do user que registou as skills a serem pesquisados
	 * @return
	 */
	public List<Skill> listAllSkillsByForumUser(String email) {

		try {

			final CriteriaQuery<Skill> criteriaQuery = em.getCriteriaBuilder().createQuery(Skill.class);
			Root<Skill> skill = criteriaQuery.from(Skill.class);
			Join<Skill, Forum> forum = skill.join("forumThatHaveThisSkill");
			Join<Forum, User> user = forum.join("owner");

			// impedir resultados repetidos
			criteriaQuery.distinct(true);
			criteriaQuery.select(skill).where(
					em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("email"), email)),
					em.getCriteriaBuilder().equal(forum.get("softDelete"), false));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Busca ativa das skills associadas as ideias/necessidades registadas por um
	 * user
	 * 
	 * @param email     - email do user que registou os interesses a serem
	 *                  pesquisados
	 * @param searchkey - letra ou palavra digitada pelo user como criterio de busca
	 * @param type      - categoria a ser pesquisada (ideia/necessidade)
	 * @return
	 */
	public List<Skill> searchSkillsByForumUser(String email, String searchKey, ForumType type) {

		try {

			final CriteriaQuery<Skill> criteriaQuery = em.getCriteriaBuilder().createQuery(Skill.class);
			Root<Skill> skill = criteriaQuery.from(Skill.class);
			Join<Skill, Forum> forum = skill.join("forumThatHaveThisSkill");
			Join<Forum, User> user = forum.join("owner");

			// impedir resultados repetidos
			criteriaQuery.distinct(true);
			criteriaQuery.select(skill).where(
					// ou
					em.getCriteriaBuilder().or(em.getCriteriaBuilder().like(skill.get("title"), '%' + searchKey + '%'),
							em.getCriteriaBuilder().like(skill.get("title"), '%' + searchKey),
							em.getCriteriaBuilder().like(skill.get("title"), searchKey + '%')),
					// e
					em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("email"), email)),
					em.getCriteriaBuilder().equal(forum.get("softDelete"), false),
					em.getCriteriaBuilder().equal(forum.get("forumType"), type));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Busca a ultima ideia/necessidade registada por um user
	 * 
	 * @param email - email do user que registou o conteúdo
	 * @return
	 */
	public Forum getLatestForumUser(String email) {
		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, User> user = forum.join("owner");

			// ordenar por ordem descendente
			criteriaQuery.orderBy(em.getCriteriaBuilder().desc(forum.get("creationDate")));
			criteriaQuery.select(forum).where(em.getCriteriaBuilder().equal(user.get("email"), email));
			// Pegar somente o primeiro resultado
			return em.createQuery(criteriaQuery).getResultList().get(0);
		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Busca a lista de projetos associados a uma ideia/necessidade
	 * 
	 * @param forumId - id da ideia/necessidade a ser pesquisada
	 * @return
	 */
	public Collection<Project> listProjectsAssociatedWithForum(int forumId) {
		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> project = criteriaQuery.from(Project.class);
			Join<Project, Forum> forum = project.join("forumAssociatedWithThisProject");

			criteriaQuery.select(project).where(em.getCriteriaBuilder().equal(forum.get("id"), forumId));

			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Buscar forums que tenham associadas a si determinadas skills e um determinado
	 * interesse
	 * 
	 * @param idsSkillsList - array de ids das skills a serem pesquisadas
	 * @param idInterest    - id do interesse a serem pesquisado
	 * @return
	 */
	public List<Forum> getUsersBySkillsAndSingleInterests(List<Integer> idsSkillsList, int idInterest) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> user = criteriaQuery.from(Forum.class);
			Join<Forum, Skill> skill = user.join("skillsAssociatedWithForum");
			Join<Forum, Interest> interest = user.join("interestsAssociatedWithForum");

			criteriaQuery.select(user).where(em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(interest.get("id"), idInterest), skill.get("id").in(idsSkillsList)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Buscar forums que tenham associadas a si determinada skill e determinados
	 * interesses.
	 * 
	 * @param idSkill         - id do da skill a serem pesquisado
	 * @param idsInterestList - array de ids dos interesses a serem pesquisadas
	 * @return
	 */
	public List<Forum> getUsersBySingleSkillsAndInterests(int idSkill, List<Integer> idsInterestList) {
		//
		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> user = criteriaQuery.from(Forum.class);
			Join<Forum, Skill> skill = user.join("skillsAssociatedWithForum");
			Join<Forum, Interest> interest = user.join("interestsAssociatedWithForum");

			criteriaQuery.select(user).where(em.getCriteriaBuilder().and(
					em.getCriteriaBuilder().equal(skill.get("id"), idSkill), interest.get("id").in(idsInterestList)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Buscar foruns que tenham associadas a si determinadas skills e determinados
	 * interesses.
	 * 
	 * @param idsSkillsList   - array de ids das skills a serem pesquisadas
	 * @param idsInterestList - array de ids dos interesses a serem pesquisadas
	 * @return
	 */
	public List<Forum> getUsersByManySkillsAndInterests(List<Integer> idsSkillsList, List<Integer> idsInterestList) {
		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> user = criteriaQuery.from(Forum.class);
			Join<Forum, Skill> skill = user.join("skillsAssociatedWithForum");
			Join<Forum, Interest> interest = user.join("interestsAssociatedWithForum");

			criteriaQuery.select(user).where(em.getCriteriaBuilder().and(skill.get("id").in(idsSkillsList),
					interest.get("id").in(idsInterestList)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Buscar forums que tenham associadas a si determinadas skills.
	 * 
	 * @param idsSkillsList - array de ids das skills a serem pesquisadas
	 * @return
	 */
	public List<Forum> getUsersByManySkills(List<Integer> idsSkillsList) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> user = criteriaQuery.from(Forum.class);
			Join<Forum, Skill> skill = user.join("skillsAssociatedWithForum");
			criteriaQuery.select(user).where(skill.get("id").in(idsSkillsList));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * * Buscar forums que tenham associadas a si determinados interesses.
	 * 
	 * @param idsInterestList - array de ids das interesses a serem pesquisadas
	 * @return
	 */
	public List<Forum> getUsersByManyInterests(List<Integer> idsInterestList) {
		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> user = criteriaQuery.from(Forum.class);
			Join<Forum, Interest> interest = user.join("interestsAssociatedWithForum");
			criteriaQuery.select(user).where(interest.get("id").in(idsInterestList));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Buscar foruns registados por um user que tenham associadas a si determinadas
	 * skills e determinado interesse.
	 * 
	 * @param idsSkillsList - array de ids das skills a serem pesquisadas
	 * @param interestId    - id do interessse a ser pesquisado
	 * @param user          - email do user que registou os interesses a serem
	 *                      pesquisados
	 * @param type          - categoria a ser pesquisada (ideia/necessidade)
	 * @return
	 */
	public List<Forum> getUsersRegisteredForumsBySkillsAndSingleInterests(List<Integer> idsSkillsList,
			Integer interestId, String user, ForumType type) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, Skill> skill = forum.join("skillsAssociatedWithForum");
			Join<Forum, Interest> interest = forum.join("interestsAssociatedWithForum");

			// Tentar o in com um and para tentar trazer users com aquela skill e com aquele
			// interesse
			criteriaQuery.select(forum)
					.where(em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(interest.get("id"), interestId),
							em.getCriteriaBuilder().equal(forum.get("owner").get("email"), user),
							em.getCriteriaBuilder().equal(forum.get("forumType"), type),
							em.getCriteriaBuilder().equal(forum.get("softDelete"), false),
							skill.get("id").in(idsSkillsList)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Buscar foruns registados por um user que tenham associadas a si determinada
	 * skill e determinados interesses.
	 * 
	 * @param skillId         - id da skill a ser pesquisada
	 * @param idsInterestList - array de ids das interesses a serem pesquisadas
	 * @param user            - email do user que registou os interesses a serem
	 *                        pesquisados
	 * @param type            - categoria a ser pesquisada (ideia/necessidade)
	 * @return
	 */
	public List<Forum> getUsersRegisteredForumsBySingleSkillsAndInterests(Integer skillId,
			List<Integer> idsInterestList, String user, ForumType type) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, Skill> skill = forum.join("skillsAssociatedWithForum");
			Join<Forum, Interest> interest = forum.join("interestsAssociatedWithForum");

			// Tentar o in com um and para tentar trazer users com aquela skill e com aquele
			// interesse
			criteriaQuery.select(forum)
					.where(em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(skill.get("id"), skillId),
							em.getCriteriaBuilder().equal(forum.get("owner").get("email"), user),
							em.getCriteriaBuilder().equal(forum.get("forumType"), type),
							em.getCriteriaBuilder().equal(forum.get("softDelete"), false),
							interest.get("id").in(idsInterestList)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}

	}

	/***
	 * Buscar foruns registados por um user que tenham associadas a si determinada
	 * skill e determinados interesses.
	 * 
	 * @param idsSkillsList   - id da skill a ser pesquisada
	 * @param idsInterestList - array de ids dos interesses a serem pesquisadas
	 * @param user            - email do user que registou os interesses a serem
	 *                        pesquisados
	 * @param type            - categoria a ser pesquisada (ideia/necessidade)
	 * @return
	 */
	public List<Forum> getUsersRegisteredForumsByManySkillsAndInterests(List<Integer> idsSkillsList,
			List<Integer> idsInterestList, String user, ForumType type) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, Skill> skill = forum.join("skillsAssociatedWithForum");
			Join<Forum, Interest> interest = forum.join("interestsAssociatedWithForum");

			criteriaQuery.select(forum)
					.where(em.getCriteriaBuilder().and(skill.get("id").in(idsSkillsList),
							interest.get("id").in(idsInterestList),
							em.getCriteriaBuilder().equal(forum.get("owner").get("email"), user),
							em.getCriteriaBuilder().equal(forum.get("forumType"), type),
							em.getCriteriaBuilder().equal(forum.get("softDelete"), false)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Buscar foruns registados por um user que tenham associadas a si determinadas
	 * skills
	 * 
	 * @param idsSkillsList - array de ids das skills a serem pesquisadas
	 * @param user          - email do user que registou os interesses a serem
	 *                      pesquisados
	 * @param type          - categoria a ser pesquisada (ideia/necessidade)
	 * @return
	 */
	public List<Forum> getUsersRegisteredForumsByManySkills(List<Integer> idsSkillsList, String user, ForumType type) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, Skill> skill = forum.join("skillsAssociatedWithForum");

			criteriaQuery.select(forum)
					.where(em.getCriteriaBuilder().and(skill.get("id").in(idsSkillsList),
							em.getCriteriaBuilder().equal(forum.get("owner").get("email"), user),
							em.getCriteriaBuilder().equal(forum.get("forumType"), type),
							em.getCriteriaBuilder().equal(forum.get("softDelete"), false)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Buscar foruns registados por um user que tenham associadas a si determinados
	 * interesses.
	 * 
	 * @param idsInterestList - array de ids dos interesses a serem pesquisadas
	 * @param user            - email do user que registou os interesses a serem
	 *                        pesquisados
	 * @param type            -- categoria a ser pesquisada (ideia/necessidade)
	 * @return
	 */
	public List<Forum> getUsersRegisteredForumsByManyInterests(List<Integer> idsInterestList, String user,
			ForumType type) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, Interest> interest = forum.join("interestsAssociatedWithForum");

			criteriaQuery.select(forum)
					.where(em.getCriteriaBuilder().and(interest.get("id").in(idsInterestList),
							em.getCriteriaBuilder().equal(forum.get("owner").get("email"), user),
							em.getCriteriaBuilder().equal(forum.get("forumType"), type),
							em.getCriteriaBuilder().equal(forum.get("softDelete"), false)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}


	/**
	 * Buscar foruns registados por um user que tenham associadas a si determinada
	 * skills.
	 * 
	 * @param skillId - id da skill a ser pesquisada
	 * @param user    - email do user que registou os interesses a serem pesquisados
	 * @param type    - categoria a ser pesquisada (ideia/necessidade)
	 * @return
	 */
	public List<Forum> filterUsersRegisteredForumBySkillId(Integer skillId, String user, ForumType type) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, Skill> skill = forum.join("skillsAssociatedWithForum");

			criteriaQuery.select(forum)
					.where(em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(skill.get("id"), skillId),
							em.getCriteriaBuilder().equal(forum.get("owner").get("email"), user),
							em.getCriteriaBuilder().equal(forum.get("forumType"), type),
							em.getCriteriaBuilder().equal(forum.get("softDelete"), false)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	/**
	 * Buscar foruns registados por um user que tenham associadas a si determinada
	 * interesse.
	 * 
	 * @param interestId - id da interesse a ser pesquisada
	 * @param user    - email do user que registou os interesses a serem pesquisados
	 * @param type    - categoria a ser pesquisada (ideia/necessidade)
	 * @return
	 */
	public List<Forum> filterUsersRegisteredForumByInterestId(Integer interestId, String user, ForumType type) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, Interest> interest = forum.join("interestsAssociatedWithForum");

			criteriaQuery.select(forum)
					.where(em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(interest.get("id"), interestId),
							em.getCriteriaBuilder().equal(forum.get("owner").get("email"), user),
							em.getCriteriaBuilder().equal(forum.get("forumType"), type),
							em.getCriteriaBuilder().equal(forum.get("softDelete"), false)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	
	/**
	 * Buscar foruns registados por um user que tenham associadas a si determinada
	 * interesse e skill.
	 * 
	 * @param interestId - id da interesse a ser pesquisada
	 * @param user    - email do user que registou os interesses a serem pesquisados
	 * @param type    - categoria a ser pesquisada (ideia/necessidade)
	 * @param skillId - id da skill a ser pesquisada
	 * @return
	 */
	public List<Forum> filterUsersRegisteredForumBySkillIdAndInterestId(Integer skillId, Integer interestId,
			String user, ForumType type) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, Interest> interest = forum.join("interestsAssociatedWithForum");
			Join<Forum, Skill> skill = forum.join("skillsAssociatedWithForum");

			criteriaQuery.select(forum)
					.where(em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(interest.get("id"), interestId),
							em.getCriteriaBuilder().equal(skill.get("id"), skillId),
							em.getCriteriaBuilder().equal(forum.get("owner").get("email"), user),
							em.getCriteriaBuilder().equal(forum.get("forumType"), type),
							em.getCriteriaBuilder().equal(forum.get("softDelete"), false)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}


	/**
	 * Buscar forum mais recente criado por um user
	 * @param email - email do user que registou os interesses a serem pesquisados
	 * @return
	 */
	public Collection<Forum> getForumsThatUserVoted(String email) {
		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);
			Join<Forum, User> user = forum.join("usersWhoHaveVoted");

			criteriaQuery.select(forum).where(em.getCriteriaBuilder().equal(user.get("email"), email));
			// Pegar somente o primeiro resultado
			return em.createQuery(criteriaQuery).getResultList();
		} catch (Exception e) {
			return null;
		}
	}

	// 
	/**
	 * Método para buscar a quantidade de comentários em um determinado Forum
	 * @param idForum - id da ideia/necessidade a ser pesquisada
	 * @return
	 */
	public long searchTotalComments(int idForum) {

		try {

			CriteriaQuery<Long> cqCount = em.getCriteriaBuilder().createQuery(Long.class);
			CriteriaQuery<Forum> cqEntity = em.getCriteriaBuilder().createQuery(Forum.class);

			Root<Forum> forum = cqCount.from(cqEntity.getResultType());
			Join<Forum, Comment> comment = forum.join("forumCommentList");

			cqCount.select(em.getCriteriaBuilder().count(comment))
					.where(em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(forum.get("id"), idForum),
							em.getCriteriaBuilder().equal(comment.get("softDelete"), false)));

			System.out.println(em.createQuery(cqCount).getSingleResult());
			return em.createQuery(cqCount).getSingleResult();

		} catch (Exception e) {
			e.printStackTrace();
			return 0;
		}
	}


	/**
	 * Método para busca ativa de forums pelo titulo
	 * @param searchKey - letra ou palavra digitada pelo user como criterio de busca
	 * @param type - categoria a ser pesquisada (ideia/necessidade)
	 * @return
	 */
	public List<Forum> getForumBySearchKey(String searchKey, ForumType type) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> forum = criteriaQuery.from(Forum.class);

			Predicate predicate1 = em.getCriteriaBuilder().or(
					em.getCriteriaBuilder().like(forum.get("title"), '%' + searchKey + '%'),
					em.getCriteriaBuilder().like(forum.get("title"), '%' + searchKey),
					em.getCriteriaBuilder().like(forum.get("title"), searchKey + '%'));

			Predicate predicate2 = em.getCriteriaBuilder().equal(forum.get("softDelete"), false);
			Predicate predicate3 = em.getCriteriaBuilder().equal(forum.get("forumType"), type);
			criteriaQuery.select(forum).where(em.getCriteriaBuilder().and(predicate1, predicate2, predicate3));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}
}
