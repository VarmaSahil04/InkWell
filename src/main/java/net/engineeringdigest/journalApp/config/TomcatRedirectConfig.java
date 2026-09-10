package net.engineeringdigest.journalApp.config;

import org.apache.catalina.Host;
import org.apache.catalina.Wrapper;
import org.apache.catalina.core.StandardContext;
import org.apache.catalina.startup.Tomcat;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.servlet.ServletContextInitializer;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * Automatically redirects requests from the domain root ("/") to "/journal/"
 * so opening https://<your-app>.up.railway.app automatically loads the journal application.
 */
@Configuration
public class TomcatRedirectConfig {

    @Bean
    public TomcatServletWebServerFactory servletWebServerFactory() {
        return new TomcatServletWebServerFactory() {
            @Override
            protected void prepareContext(Host host, ServletContextInitializer[] initializers) {
                super.prepareContext(host, initializers);
                String contextPath = getContextPath();
                if (contextPath != null && !contextPath.trim().isEmpty() && !"/".equals(contextPath.trim())) {
                    StandardContext rootContext = new StandardContext();
                    rootContext.setPath("");
                    rootContext.addLifecycleListener(new Tomcat.FixContextListener());

                    Wrapper redirectServlet = rootContext.createWrapper();
                    redirectServlet.setName("rootRedirectServlet");
                    redirectServlet.setServlet(new HttpServlet() {
                        @Override
                        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
                            String uri = req.getRequestURI();
                            if (uri == null || uri.isEmpty() || "/".equals(uri)) {
                                resp.sendRedirect(contextPath + "/");
                            } else {
                                resp.sendRedirect(contextPath + uri);
                            }
                        }
                    });
                    redirectServlet.setLoadOnStartup(1);

                    rootContext.addChild(redirectServlet);
                    rootContext.addServletMappingDecoded("/*", "rootRedirectServlet");

                    host.addChild(rootContext);
                }
            }
        };
    }
}
