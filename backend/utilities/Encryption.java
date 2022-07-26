package pt.uc.dei.projfinal.utilities;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class Encryption {
	
private static MessageDigest messageDigest = null;
	

//1- Primeiramente vamos criar um método estático para geração do algoritmo de criptografia:
	static {
		try {
			/*Para se obter uma instância de um algoritmo de criptografia Message Digest, 
			 * utiliza-se o método getInstance() da classe MessageDigest.*/
			messageDigest = MessageDigest.getInstance("MD5");
			
			/*Após a chamada a getInstance(), você possui uma referência a um objeto pronto para 
			 * criptografar seus dados utilizando o algoritmo especificado. Neste caso o MD5.*/
			
		} catch (NoSuchAlgorithmException nsae) {
			nsae.printStackTrace();
		} catch (NullPointerException npe) {
			npe.printStackTrace();
		}
	}

	
//2- Em seguida criamos um método estático para gerar a chave criptografada.	

	private static char[] encryptedKeyGenerator(byte[] text) {
        
		//os nomes hex... , foram usados por o próprio JAVA yem o método toHexString.
		char[] hexOutput = new char[text.length * 2];
        String hexString;

        for (int i = 0; i < text.length; i++) {
        	
            hexString = "00" + Integer.toHexString(text[i]);
            
            hexString.toUpperCase().getChars(hexString.length() - 2,
                                    hexString.length(), hexOutput, i * 2);
        }
        return hexOutput;
	}
	
	
	/* 3 - Feito isto, criaremos agora um método público que receberá o texto a ser criptografado:*/
	
	public static String encryptPassword(String password) {
        if (messageDigest != null) {
        	//Finalmente, para gerar a chave criptografada, você chama o método digest().
            return new String(encryptedKeyGenerator(messageDigest.digest(password.getBytes())));
        }
        return null;
	}

}
