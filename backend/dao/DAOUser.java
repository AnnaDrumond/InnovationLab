package pt.uc.dei.projfinal.dao;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;

import javax.ejb.Stateless;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Expression;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.JoinType;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import javax.persistence.criteria.Subquery;

import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Conjunction;
import org.hibernate.criterion.DetachedCriteria;
import org.hibernate.criterion.Projection;
import org.hibernate.criterion.Projections;
import org.hibernate.criterion.Property;
import org.hibernate.criterion.Restrictions;

import pt.uc.dei.projfinal.dto.DTOUser;
import pt.uc.dei.projfinal.dto.DTOUserComplete;
import pt.uc.dei.projfinal.entity.Forum;
import pt.uc.dei.projfinal.entity.Interest;
import pt.uc.dei.projfinal.entity.Project;
import pt.uc.dei.projfinal.entity.Skill;
import pt.uc.dei.projfinal.entity.User;
import pt.uc.dei.projfinal.entity.User.UserType;
import pt.uc.dei.projfinal.entity.Forum.ForumType;
import pt.uc.dei.projfinal.utilities.Encryption;

@Stateless
public class DAOUser extends AbstractDao<User> {

	private static final long serialVersionUID = 1L;

	public DAOUser() {
		super(User.class);
	}

	// método para converter o dto na entidade - user
	public User convertDtoToEntity(DTOUserComplete refDto) {
		User user = new User();
		user.setFirstName(refDto.getFirstName());
		user.setLastName(refDto.getLastName());
		user.setPassword(refDto.getPassword());
		user.setWorkplace(refDto.getWorkplace().toUpperCase());// para ir para a BD tudo em maiusculas
		user.setEmail(refDto.getEmail());
		return user;
	}

	public DTOUser convertEntityToDto(User user) {
		DTOUser dtoUser = new DTOUser();
		dtoUser.setEmail(user.getEmail());
		dtoUser.setFullName(user.getFirstName() + " " + user.getLastName());
		dtoUser.setNickname(user.getNickname());
		dtoUser.setPhoto(user.getPhoto());
		dtoUser.setVisibility(user.getVisilibityUser().toString());
		dtoUser.setType(user.getTypeUser().toString());
		dtoUser.setWorkplace(user.getWorkplace());
		return dtoUser;

	}

	public DTOUserComplete convertEntityToDtoComplete(User user) {
		DTOUserComplete dtoUser = new DTOUserComplete();
		dtoUser.setEmail(user.getEmail());
		dtoUser.setFirstName(user.getFirstName());
		dtoUser.setLastName(user.getLastName());
		dtoUser.setEmail(user.getEmail());
		dtoUser.setWorkplace(user.getWorkplace());
		dtoUser.setNickname(user.getNickname());
		dtoUser.setPhoto(user.getPhoto());
		dtoUser.setBiography(user.getBiography());
		dtoUser.setAvailability(user.getAvailability());
		dtoUser.setVisibility(user.getVisilibityUser().toString());
		dtoUser.setType(user.getTypeUser().toString());
		return dtoUser;
	}

	// método para converter o user dto na entidade - user
	public User convertCompleteDtoToEntity(DTOUserComplete refDto, User user) {

		user.setFirstName(refDto.getFirstName());
		user.setLastName(refDto.getLastName());
		user.setAvailability(refDto.getAvailability());
		user.setBiography(refDto.getBiography());
		user.setNickname(refDto.getNickname());
		user.setPhoto(refDto.getPhoto());
		user.setWorkplace(refDto.getWorkplace());
		return user;
	}

	// método para encontrar o utilizador através da sua informação de login
	// (email e password)
	public User findByUserInfo(String email, String password) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);

			criteriaQuery.select(user)
					.where(em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("email"), email),
							em.getCriteriaBuilder().equal(user.get("password"), password)));

			return em.createQuery(criteriaQuery).getSingleResult();

		} catch (Exception e) {
			return null;
		}
	}

	// método para obter a lista de projetos que o user favoritou/ votou
	public Collection<Project> getAssociatedProjects(String email, String join) {

		try {

			final CriteriaQuery<Project> criteriaQuery = em.getCriteriaBuilder().createQuery(Project.class);
			Root<Project> rootProject = criteriaQuery.from(Project.class);

			Join<Project, User> user = rootProject.join(join);

			criteriaQuery.select(rootProject)
					.where(em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("email"), email),
							em.getCriteriaBuilder().equal(rootProject.get("softDelete"), false)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// método para obter a lista de forums que o user favoritou/ votou
	public Collection<Forum> getAssociatedForum(String email, String join) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> rootForum = criteriaQuery.from(Forum.class);

			Join<Forum, User> user = rootForum.join(join);

			criteriaQuery.select(rootForum).where(
					em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("email"), email)),
					em.getCriteriaBuilder().equal(rootForum.get("softDelete"), false));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// método para obter a lista de skills do utilizador
	public Collection<Skill> getAssociatedSkills(String email, String join) {

		try {

			final CriteriaQuery<Skill> criteriaQuery = em.getCriteriaBuilder().createQuery(Skill.class);
			Root<Skill> rootSkill = criteriaQuery.from(Skill.class);
			Join<Skill, User> user = rootSkill.join(join);
			criteriaQuery.select(rootSkill).where(em.getCriteriaBuilder().equal(user.get("email"), email));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// método para encontrar o utilizador através do token temporário
	public User findUserByToken(String token) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			criteriaQuery.select(user).where(em.getCriteriaBuilder().equal(user.get("temporaryToken"), token));
			return em.createQuery(criteriaQuery).getSingleResult();

		} catch (Exception e) {
			return null;
		}
	}

	// Buscar Utilizadores, pesquisando por nome/alcunha
	public List<User> searchForUserByNameOrNickname(String searchKey) {

		// System.out.println("searchForUserByNameOrNickname dao " + searchKey);
		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);

			Root<User> root = criteriaQuery.from(User.class);
			// criteriaQuery.distinct(true);// se quiser não ter resultados repetidos
			Predicate predicateFirstName = em.getCriteriaBuilder().or(
					em.getCriteriaBuilder().like(root.get("firstName"), '%' + searchKey + '%'),
					em.getCriteriaBuilder().like(root.get("firstName"), '%' + searchKey),
					em.getCriteriaBuilder().like(root.get("firstName"), searchKey + '%'));

			Predicate predicateLastName = em.getCriteriaBuilder().or(
					em.getCriteriaBuilder().like(root.get("lastName"), '%' + searchKey + '%'),
					em.getCriteriaBuilder().like(root.get("lastName"), '%' + searchKey),
					em.getCriteriaBuilder().like(root.get("lastName"), searchKey + '%'));

			Predicate predicateNickname = em.getCriteriaBuilder().or(
					em.getCriteriaBuilder().like(root.get("nickname"), '%' + searchKey + '%'),
					em.getCriteriaBuilder().like(root.get("nickname"), '%' + searchKey),
					em.getCriteriaBuilder().like(root.get("nickname"), searchKey + '%'));

			criteriaQuery.where(em.getCriteriaBuilder().or(predicateFirstName, predicateLastName, predicateNickname),
					(em.getCriteriaBuilder()
							.and(em.getCriteriaBuilder().notEqual(root.get("typeUser"), UserType.VISITOR))));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// Buscar lista de visualizadores de um determinado user
	// Quem liga User com User é usersWhoCanView
	// Citeria API relação recursiva/recursivo
	// O pensamento é inverso
	public List<User> getListUsersWhoCanView(String emailUserToEdit) {

		// System.out.println("getListUsersWhoCanView");
		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> userRoot = criteriaQuery.from(User.class);
			Join<User, User> user = userRoot.join("usersWhoCanView", JoinType.LEFT);
			criteriaQuery.select(user).where(em.getCriteriaBuilder().equal(userRoot.get("email"), emailUserToEdit));
			return em.createQuery(criteriaQuery).getResultList();
			//
		} catch (Exception e) {
			return null;
		}
	}

	public Collection<Interest> getAssociatedInterests(String email, String join) {
		try {

			final CriteriaQuery<Interest> criteriaQuery = em.getCriteriaBuilder().createQuery(Interest.class);
			Root<Interest> userRoot = criteriaQuery.from(Interest.class);
			Join<Interest, User> interest = userRoot.join(join);
			criteriaQuery.select(userRoot).where(em.getCriteriaBuilder().equal(interest.get("email"), email));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// Buscar a lista de ideias favoritas de um determinado user
	public Collection<Forum> filterByUserFavoriteIdeas(String email, ForumType type) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> rootForum = criteriaQuery.from(Forum.class);
			Join<Forum, User> user = rootForum.join("usersWhoFavorited");

			criteriaQuery.select(rootForum).where(
					em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("email"), email)),
					em.getCriteriaBuilder().equal(rootForum.get("forumType"), type),
					em.getCriteriaBuilder().equal(rootForum.get("softDelete"), false));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// Buscar a lista de necessidades favoritas de um determinado user
	public Collection<Forum> filterByUserFavoriteNecessity(String email, ForumType type) {

		try {

			final CriteriaQuery<Forum> criteriaQuery = em.getCriteriaBuilder().createQuery(Forum.class);
			Root<Forum> rootForum = criteriaQuery.from(Forum.class);
			Join<Forum, User> user = rootForum.join("usersWhoFavorited");

			criteriaQuery.select(rootForum).where(
					em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("email"), email)),
					em.getCriteriaBuilder().equal(rootForum.get("forumType"), type));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// Buscar todos os Users NÂO vistantes que trabalham em um determinado local
	public List<User> getUsersByWorkplace(String workplace) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			criteriaQuery.select(user)
					.where(em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("workplace"), workplace),
							em.getCriteriaBuilder().notEqual(user.get("typeUser"), UserType.VISITOR)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// Buscar todos os Users que possuem aquelas determinadas skills (no plural)
	// associadas a si
	public List<User> getUsersByAssociateSkillsList(List<Integer> ids) {

		System.out.println("getUsersByAssociateSkills dao");

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);

			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Skill> skill = user.join("userSkillList");

			criteriaQuery.select(user).where(skill.get("id").in(ids));

			System.out.println(em.createQuery(criteriaQuery).getResultList());
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	public List<User> getUsersByAssociateSkill(int id) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);

			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Skill> skill = user.join("userSkillList");

			criteriaQuery.select(user).where(em.getCriteriaBuilder().equal(skill.get("id"), id));

			System.out.println(em.createQuery(criteriaQuery).getResultList());
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	public List<User> getUsersByWorkplaceAndSkills(List<Integer> idsList, String workplace) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Skill> skill = user.join("userSkillList");

			criteriaQuery.select(user);

			Predicate one = em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("workplace"), workplace),
					em.getCriteriaBuilder().notEqual(user.get("typeUser"), UserType.VISITOR));
			// 
			Predicate two = skill.get("id").in(idsList);

			criteriaQuery.where(em.getCriteriaBuilder().and(one, two));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	public List<User> getUsersByWorkplaceAndSingleSkill(int id, String workplace) {
		System.out.println("getUsersByWorkplaceAndSingleSkill - dao");

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Skill> skill = user.join("userSkillList");

			criteriaQuery.select(user);

			// users com determinado workplace
			Predicate one = em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("workplace"), workplace),
					em.getCriteriaBuilder().notEqual(user.get("typeUser"), UserType.VISITOR));
			// verificar se os users tem as skills
			Predicate two = em.getCriteriaBuilder().equal(skill.get("id"), id);

			criteriaQuery.where(em.getCriteriaBuilder().and(one, two));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// multiplos skills e multiplos interesses e um workplace
	public List<User> getUsersByInterestsAndSkillsAndWorkplace(List<Integer> idsSkills, List<Integer> idsInterest,
			String workplace) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Skill> skill = user.join("userSkillList");
			Join<User, Interest> interest = user.join("userInterestList");

			// Tentar o in com um and para tentar trazer users com aquela skill e com aquele
			// interesse
			criteriaQuery.select(user);

			Predicate one = em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("workplace"), workplace),
					em.getCriteriaBuilder().notEqual(user.get("typeUser"), UserType.VISITOR));

			Predicate two = em.getCriteriaBuilder().and(skill.get("id").in(idsSkills),
					interest.get("id").in(idsInterest));

			criteriaQuery.where(em.getCriteriaBuilder().and(one, two));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}

	}

	// um interesse e várias skills
	public List<User> getUsersBySingleInterestsAndSkillsAndWorkplace(List<Integer> idsSkillsList, int idInterest,
			String workplace) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Skill> skill = user.join("userSkillList");
			Join<User, Interest> interest = user.join("userInterestList");

			criteriaQuery.select(user);

			Predicate one = em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("workplace"), workplace),
					em.getCriteriaBuilder().notEqual(user.get("typeUser"), UserType.VISITOR));

			// varias skills
			Predicate two = em.getCriteriaBuilder().and(skill.get("id").in(idsSkillsList));

			// um interesse
			Predicate three = em.getCriteriaBuilder().equal(interest.get("id"), idInterest);

			criteriaQuery.where(em.getCriteriaBuilder().and(one, two, three));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// um skill e vários interesses
	public List<User> getUsersByInterestsAndSingleSkillAndWorkplace(int idSkill, List<Integer> idsInterestList,
			String workplace) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Skill> skill = user.join("userSkillList");
			Join<User, Interest> interest = user.join("userInterestList");

			criteriaQuery.select(user);
			Predicate one = em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("workplace"), workplace),
					em.getCriteriaBuilder().notEqual(user.get("typeUser"), UserType.VISITOR));
			// varios interesses
			Predicate two = em.getCriteriaBuilder().and(interest.get("id").in(idsInterestList));
			// uma skill
			Predicate three = em.getCriteriaBuilder().equal(skill.get("id"), idSkill);
			criteriaQuery.where(em.getCriteriaBuilder().and(one, two, three));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// somente uma skill & somente um interesse e um workplace
	public List<User> getUsersByInterestsAndSkillsAndWorkplaceSingleCase(int idSkill, int idInterest,
			String workplace) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Skill> skill = user.join("userSkillList");
			Join<User, Interest> interest = user.join("userInterestList");

			criteriaQuery.select(user)
					.where(em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(skill.get("id"), idSkill),
							em.getCriteriaBuilder().equal(interest.get("id"), idInterest),
							em.getCriteriaBuilder().equal(user.get("workplace"), workplace)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}

	}

	public List<User> getUsersByWorkplaceAndSingleInterest(Integer id, String workplace) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Interest> interest = user.join("userInterestList");

			criteriaQuery.select(user);

			// users com determinado workplace
			Predicate one = em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("workplace"), workplace),
					em.getCriteriaBuilder().notEqual(user.get("typeUser"), UserType.VISITOR));
			// verificar se os users tem as skills
			Predicate two = em.getCriteriaBuilder().equal(interest.get("id"), id);

			criteriaQuery.where(em.getCriteriaBuilder().and(one, two));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	public List<User> getUsersByWorkplaceAndInterest(List<Integer> idsList, String workplace) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Interest> interest = user.join("userInterestList");

			criteriaQuery.select(user);
			// users com determinado workplace
			Predicate one = em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(user.get("workplace"), workplace),
					em.getCriteriaBuilder().notEqual(user.get("typeUser"), UserType.VISITOR));
			// verificar se os users tem as skills
			Predicate two = interest.get("id").in(idsList);

			criteriaQuery.where(em.getCriteriaBuilder().and(one, two));
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	public List<User> getUsersByAssociateInterest(Integer id) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);

			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Interest> interest = user.join("userInterestList");

			criteriaQuery.select(user).where(em.getCriteriaBuilder().equal(interest.get("id"), id));

			System.out.println(em.createQuery(criteriaQuery).getResultList());
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	public List<User> getUsersByAssociateInterestsList(List<Integer> ids) {
		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);

			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Interest> interest = user.join("userInterestList");

			criteriaQuery.select(user).where(interest.get("id").in(ids));

			System.out.println(em.createQuery(criteriaQuery).getResultList());
			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// Somente multiplos skills e multiplos interesses - SEM workplace
	public List<User> getUsersBySkillsAndInterests(List<Integer> idsSkills, List<Integer> idsInterest) {
	
		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Skill> skill = user.join("userSkillList");
			Join<User, Interest> interest = user.join("userInterestList");

			criteriaQuery.select(user).where(
					em.getCriteriaBuilder().and(skill.get("id").in(idsSkills), interest.get("id").in(idsInterest)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// Somente UMA skill e UM interesse - SEM workplace
	public List<User> getUsersBySingleSkillAndSingleInterest(int idSkill, int idInterest) {

		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Skill> skill = user.join("userSkillList");
			Join<User, Interest> interest = user.join("userInterestList");

			// Tentar o in com um and para tentar trazer users com aquela skill e com aquele
			// interesse
			criteriaQuery.select(user)
					.where(em.getCriteriaBuilder().and(em.getCriteriaBuilder().equal(skill.get("id"), idSkill),
							em.getCriteriaBuilder().equal(interest.get("id"), idInterest)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// Somente UMA skill e vários interesse - SEM workplace
	public List<User> getUsersBySingleSkillAndInterests(int idSkill, List<Integer> idsInterest) {
		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Skill> skill = user.join("userSkillList");
			Join<User, Interest> interest = user.join("userInterestList");

			// Tentar o in com um and para tentar trazer users com aquela skill e com aquele
			// interesse
			criteriaQuery.select(user).where(em.getCriteriaBuilder()
					.and(em.getCriteriaBuilder().equal(skill.get("id"), idSkill), interest.get("id").in(idsInterest)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// Somente UM interesse e várias skills - SEM workplace
	public List<User> getUsersBySkillsAndSingleInterests(List<Integer> idsSkills, int idInterest) {
		// TODO Auto-generated method stub
		try {

			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			Join<User, Skill> skill = user.join("userSkillList");
			Join<User, Interest> interest = user.join("userInterestList");

			// Tentar o in com um and para tentar trazer users com aquela skill e com aquele
			// interesse
			criteriaQuery.select(user).where(em.getCriteriaBuilder()
					.and(em.getCriteriaBuilder().equal(interest.get("id"), idInterest), skill.get("id").in(idsSkills)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	// busca ativa workplace
	public List<String> activeSearchByWorkplace(String workplace) {
		System.out.println("activeSearchByWorkplace dao " + workplace);
		try {

			final CriteriaQuery<String> criteriaQuery = em.getCriteriaBuilder().createQuery(String.class);

			Root<User> user = criteriaQuery.from(User.class);
			criteriaQuery.distinct(true);// se quiser não ter resultados repetidos

			criteriaQuery.select(user.get("workplace"))
					.where(em.getCriteriaBuilder().or(
							em.getCriteriaBuilder().like(user.get("workplace"), '%' + workplace + '%'),
							em.getCriteriaBuilder().like(user.get("workplace"), '%' + workplace),
							em.getCriteriaBuilder().like(user.get("workplace"), workplace + '%')));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}

	public List<String> activeSearchByWorkplaceViewerList(String emailUserToEdit, String workplace) {

		try {

			final CriteriaQuery<String> criteriaQuery = em.getCriteriaBuilder().createQuery(String.class);

			Root<User> userRoot = criteriaQuery.from(User.class);
			Join<User, User> user = userRoot.join("usersWhoCanView", JoinType.LEFT);
			criteriaQuery.distinct(true);
			
			criteriaQuery.select(user.get("workplace"))
					.where(em.getCriteriaBuilder().or(
							em.getCriteriaBuilder().like(user.get("workplace"), '%' + workplace + '%'),
							em.getCriteriaBuilder().like(user.get("workplace"), '%' + workplace),
							em.getCriteriaBuilder().like(user.get("workplace"), workplace + '%')),
							em.getCriteriaBuilder()
									.and(em.getCriteriaBuilder().equal(userRoot.get("email"), emailUserToEdit)));

			return em.createQuery(criteriaQuery).getResultList();

		} catch (Exception e) {
			return null;
		}
	}
	
	//método para obter a lista de todos os administradores do sistema e utilizadores standard
	public List<User> getAllUsers(){
		try {
			
			final CriteriaQuery<User> criteriaQuery = em.getCriteriaBuilder().createQuery(User.class);
			Root<User> user = criteriaQuery.from(User.class);
			
			criteriaQuery.orderBy(em.getCriteriaBuilder().asc(user.get("firstName")));
			
			criteriaQuery.select(user).where(em.getCriteriaBuilder().notEqual(user.get("typeUser"), UserType.VISITOR));

			return em.createQuery(criteriaQuery).getResultList();
			
		}catch(Exception e) {
			return null;
		}
	}

}
