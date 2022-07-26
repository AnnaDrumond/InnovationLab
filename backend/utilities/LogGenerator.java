package pt.uc.dei.projfinal.utilities;

import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.log4j.FileAppender;
import org.apache.log4j.Level;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.apache.log4j.MDC;
import org.apache.log4j.PatternLayout;

public class LogGenerator {

	// o getRootLooger seria para pegar a raiz - supostamente daria para usar em
	// todas as classes que eu precisar chamar o logger
	private static final Logger logger = LogManager.getRootLogger();
	private static FileAppender fileappender = new FileAppender();

	public static void generateAndWriteLog(HttpServletRequest request, ActionLog action) throws UnknownHostException {
	
		// fornece contextos de diagnóstico mapeados . Um Contexto de Diagnóstico
		// Mapeado , ou MDC em resumo, é um instrumento para distinguir a saída de log
		// intercalada de diferentes fontes
		MDC.put("ip", findAndReturnIpClient(request));
		// O PatternLayout fornece mecanismos para imprimir o conteúdo do ThreadContext
		// Use %X{key}para incluir a chave especificada, no caso "ip"
		logger.setLevel(Level.INFO);
		logger.setAdditivity(false);// evitar duplicação de logs
		fileappender.setAppend(true);// Quando true - o padrão, os registros serão anexados ao final do arquivo.
		fileappender.setName("FileLogger");
		fileappender.setFile("LogFile/innovationlab_log_file.log");
		fileappender.setThreshold(Level.INFO);
		// colocar no meu FileAppender o layout que defini anteriormente
		fileappender.setLayout(new PatternLayout("[%d{DATE}] [Ip %X{ip}] [%p] %m%n"));
		fileappender.activateOptions();
		// Adicionar o FileAppender ao logger
		logger.addAppender(fileappender);
		String emailAuthor = returnEmailActionAuthor(request);
		// logger a ser escrito no ficheiro
		logger.info("- Action " + action + " - Author " + emailAuthor);
		// remover o appender a fim de evitar logs repetidos, e incrementos
		logger.removeAppender(fileappender);
		// Remova todos os valores do MDC.
		MDC.clear();
	}

	// Como executo o servlet em minha máquina local (de desenvolvimento) e também
	// chamo-o de um navegador na mesma máquina, a saída do IpClient será sempre
	// 127.0.0.1
	public static String findAndReturnIpClient(HttpServletRequest request) {

		List<String> possibleHeaders = new ArrayList<String>();

		// Se a máquina do cliente estiver atrás de um proxy, o endereço
		// IP do cliente estará no cabeçalho de solicitação HTTP X-Forwarded-For (XFF)
		// Garantir que será resgatado este endereço IP:
		possibleHeaders.addAll(Arrays.asList("X-Forwarded-For", "Proxy-Client-IP", "WL-Proxy-Client-IP",
				"HTTP_X_FORWARDED_FOR", "HTTP_X_FORWARDED", "HTTP_X_CLUSTER_CLIENT_IP", "HTTP_CLIENT_IP",
				"HTTP_FORWARDED_FOR", "HTTP_FORWARDED", "HTTP_VIA", "REMOTE_ADDR"));

		for (String header : possibleHeaders) {
			// Tentar buscar o ip pelo cabeçalho
			String ipAddress = request.getHeader(header);
			// Verificar se conseguiu obter o IP pelo cabeçalho
			if (ipAddress != null && ipAddress.length() != 0 && !"unknown".equalsIgnoreCase(ipAddress)) {
				return ipAddress;
			}
		}
		// Se não achou nas hipóteses acima, envia o valor encontrado em
		// getRemoteAddr().
		return request.getRemoteAddr();
	}


	public static String returnEmailActionAuthor(HttpServletRequest request) {

		String author = "empty";

		// Tentar pegar o email do author na session
		if (request.getSession().getAttribute("user") != null) {
			author = String.valueOf(request.getSession().getAttribute("user"));
			return author;

			// Se não encontrou na session, busca no header
		} else {
			return request.getHeader("email");
		}

	}

}

//https://logging.apache.org/log4j/2.x/manual/appenders.html
//https://docs.oracle.com/javase/7/docs/api/java/net/InetAddress.html
//https://logging.apache.org/log4j/2.x/manual/thread-context.html
//https://logging.apache.org/log4j/2.x/manual/layouts.html
//https://httpd.apache.org/docs/2.4/mod/mod_log_config.html
//https://docs.oracle.com/javaee/6/api/javax/servlet/ServletRequest.html#getRemoteAddr()
//https://en.wikipedia.org/wiki/X-Forwarded-For
//https://logging.apache.org/log4j/1.2/apidocs/org/apache/log4j/MDC.html
//https://logging.apache.org/log4net/log4net-1.2.12/release/sdk/log4net.Appender.FileAppender.ActivateOptions.html
// https://stackoverflow.com/questions/22199830/any-way-to-get-the-path-parameters-in-httpservlet-request
//CAso o removeappender do final dê erro, posso usar este abaixo
// LogManager.shutdown();
// Ou o removeAllappenders()
