package pt.uc.dei.projfinal.utilities;

import java.util.logging.Level;
import java.util.logging.Logger;

import javax.annotation.Resource;
import javax.ejb.Stateless;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.naming.InitialContext;
import javax.naming.NamingException;

//https://www.oracle.com/java/technologies/java-beans-activation.html
//Não guarda estado.
@Stateless
public class SendHTMLEmail {

	@Resource
	private static Session session;

	// A exceção precisa ser lançada, pois porque InitialContext() throws
	// NamingException.
	public static void triggerEmailRegistration(String receiver, String token) throws NamingException {

		try {
			// Essa classe é o contexto inicial para realizar operações de nomenclatura.
			// https://docs.oracle.com/javase/7/docs/api/javax/naming/InitialContext.html
			// Não está como escopo global, porque InitialContext() throws NamingException.
			InitialContext inicialContext = new InitialContext();

			// Recuperar o objeto nomeado
			session = (Session) inicialContext.lookup("java:jboss/mail/gmail");

			// Criar um objeto MimeMessage padrão.
			/*
			 * Extensões Multi função para Mensagens de Internet (sigla MIME do inglês
			 * Multipurpose Internet Mail Extensions) é uma norma da internet para o formato
			 * das mensagens de correio eletrônico. A grande maioria das mensagens de
			 * correio eletrônico são trocadas usando o protocolo SMTP e usam o formato
			 * MIME. As mensagens na Internet tem uma associação tão estreita aos padrões
			 * SMTP e MIME que algumas vezes são chamadas de mensagens SMTP/MIME.
			 * https://canaltech.com.br/produtos/O-que-e-MIME/
			 */
			MimeMessage message = new MimeMessage(session);

			message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(receiver));

			// assunto do e-mail
			message.setSubject("Validar e-mail de registo");

			message.setContent(
					"<h3>Seja bem-vindo,</h3><h3><br></h3><h3>Para validar seu registo, acesse o link abaixo ou em caso de erro http://localhost:8080/adrumond-jvalente-frontend/validate-register.html?"
							+ token
							+ ":</h3><p><br></p><h2 class=\"ql-align-center\"><a href=\"http://localhost:8080/adrumond-jvalente-frontend/validate-register.html?t="
							+ token
							+ "\" target=\"_blank\" style=\"color: rgb(230, 0, 0);\">VALIDAR REGISTO</a></h2><p class=\"ql-align-center\"><br></p><p class=\"ql-align-center\"><span style=\"color: rgb(130, 130, 130);\">© 2022 projeto final - Anna &amp; Joana. All rights reserved.</span></p><p class=\"ql-align-center\"><br></p>",
					"text/html");

			System.out.println("estou antes de send------------------");
			// Enviar e-mail
			Transport.send(message);
			System.out.println("Sent message successfully....");

		} catch (MessagingException error) {
			// https://docs.oracle.com/javase/7/docs/api/java/util/logging/Logger.html
			Logger.getLogger(SendHTMLEmail.class.getName()).log(Level.WARNING, "Cannot send mail", error);
			error.printStackTrace();

		}

	}

	public static void triggerEmailResetPassword(String receiver, String token) throws NamingException {

		try {

			// Essa classe é o contexto inicial para realizar operações de nomenclatura.
			// https://docs.oracle.com/javase/7/docs/api/javax/naming/InitialContext.html
			InitialContext inicialContext = new InitialContext();

			// Recuperar o objeto nomeado
			session = (Session) inicialContext.lookup("java:jboss/mail/gmail");

			Message message = new MimeMessage(session);
			message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(receiver));

			// assunto do e-mail
			message.setSubject("Reset de password");

			message.setContent(
					"<h3>Olá,</h3><h3><br></h3><h3>Para fazer reset a sua password, acesse o link abaixo ou em caso de erro http://localhost:8080/adrumond-jvalente-frontend/validate-register.html?"
							+ token
							+ ":</h3><p><br></p><h2 class=\"ql-align-center\"><a href=\"http://localhost:8080/adrumond-jvalente-frontend/reset-pwd.html?t="
							+ token
							+ "\" target=\"_blank\" style=\"color: rgb(230, 0, 0);\">RESET PASSWORD</a></h2><p class=\"ql-align-center\"><br></p><p class=\"ql-align-center\"><span style=\"color: rgb(130, 130, 130);\">© 2022 projeto final - Anna &amp; Joana. All rights reserved.</span></p><p class=\"ql-align-center\"><br></p>",
					"text/html");

			System.out.println("estou antes de send------------------");
			// Enviar e-mail
			Transport.send(message);
			System.out.println("Sent message successfully....");

		} catch (MessagingException error) {

			Logger.getLogger(SendHTMLEmail.class.getName()).log(Level.WARNING, "Cannot send mail", error);
			error.printStackTrace();

		}

	}

}
