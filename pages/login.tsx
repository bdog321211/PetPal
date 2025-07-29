import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { PawPrint, Info, User, LogIn } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/Tabs";
import { PasswordLoginForm } from "../components/PasswordLoginForm";
import { PasswordRegisterForm } from "../components/PasswordRegisterForm";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import styles from "./login.module.css";

interface TestUser {
  email: string;
  role: string;
  description: string;
  variant: "default" | "secondary" | "success" | "warning";
}

const testUsers: TestUser[] = [
  {
    email: "parkourninja1118@gmail.com",
    role: "Pet Owner",
    description: "Regular user with multiple pets",
    variant: "default"
  },
  {
    email: "sarah.petlover@example.com", 
    role: "Pet Owner",
    description: "New user with one cat",
    variant: "default"
  },
  {
    email: "mike.dogsitter@example.com",
    role: "Pet Sitter", 
    description: "Professional pet sitter with high ratings",
    variant: "secondary"
  },
  {
    email: "lisa.trainer@example.com",
    role: "Trainer",
    description: "Certified dog trainer and behaviorist", 
    variant: "success"
  },
  {
    email: "alex.petstore@example.com",
    role: "Store Owner",
    description: "Local pet store manager",
    variant: "warning"
  }
];

const commonPassword = "Truck-Plant-4-Speak-Story";

const LoginPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("login");

  const handleQuickLogin = (email: string) => {
    // Find the login form and populate it
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = document.querySelector('input[type="password"]') as HTMLInputElement;
    const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
    
    if (emailInput && passwordInput && submitButton) {
      emailInput.value = email;
      passwordInput.value = commonPassword;
      
      // Trigger change events to update form state
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Submit the form
      setTimeout(() => {
        submitButton.click();
      }, 100);
    }
  };

  return (
    <>
      <Helmet>
        <title>Login or Sign Up | Floot</title>
        <meta
          name="description"
          content="Log in to your Floot account or sign up to join our pet-loving community."
        />
      </Helmet>
      <main className={styles.page}>
        <div className={styles.authContainer}>
          <div className={styles.header}>
            <Link to="/" className={styles.logoLink}>
              <PawPrint className={styles.logoIcon} />
              <h1 className={styles.title}>Floot</h1>
            </Link>
            <p className={styles.subtitle}>
              {activeTab === "login"
                ? "Welcome back! Please log in to your account."
                : "Join our community of pet lovers."}
            </p>
          </div>

          <Tabs
            defaultValue="login"
            className={styles.tabs}
            onValueChange={setActiveTab}
          >
            <TabsList className={styles.tabsList}>
              <TabsTrigger value="login" className={styles.tabTrigger}>
                Log In
              </TabsTrigger>
              <TabsTrigger value="register" className={styles.tabTrigger}>
                Sign Up
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login" className={styles.tabContent}>
              <PasswordLoginForm />
            </TabsContent>
            <TabsContent value="register" className={styles.tabContent}>
              <PasswordRegisterForm />
            </TabsContent>
          </Tabs>

          {activeTab === "login" && (
            <div className={styles.testCredentials}>
              <div className={styles.testCredentialsHeader}>
                <Info size={16} />
                <span>Test User Accounts</span>
              </div>
              <p className={styles.testCredentialsDescription}>
                Click any button below to quickly log in as different user types and explore various features:
              </p>
              
              <div className={styles.testUsersList}>
                {testUsers.map((user, index) => (
                  <div key={index} className={styles.testUser}>
                    <div className={styles.testUserInfo}>
                      <div className={styles.testUserHeader}>
                        <User size={14} />
                        <span className={styles.testUserEmail}>{user.email}</span>
                        <Badge variant={user.variant} className={styles.roleBadge}>
                          {user.role}
                        </Badge>
                      </div>
                      <p className={styles.testUserDescription}>{user.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickLogin(user.email)}
                      className={styles.quickLoginButton}
                    >
                      <LogIn size={14} />
                      Quick Login
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className={styles.passwordNote}>
                <strong>Common Password:</strong> {commonPassword}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default LoginPage;