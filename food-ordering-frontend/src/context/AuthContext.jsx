import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginApi } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // user: { id, email, role }
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('jwt');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  // now expects email + password (not username)
  const login = async ({email, password}) => {
    // const { token: jwt, user: userInfo } = await loginApi(email, password);
    const { data } = await loginApi({ email, password });
    const { token: jwt, user: userInfo } = data;
    // setToken(jwt);
    // setUser(userInfo);
    // localStorage.setItem("jwt", jwt);
    // localStorage.setItem("user", JSON.stringify(userInfo));

    // userInfo is: { id, email, role }
    setToken(jwt);
    setUser(userInfo);
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('user', JSON.stringify(userInfo));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        isAdmin: user?.role === 'admin',
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);



// import React, { createContext, useContext, useEffect, useState } from 'react';
// import { loginApi } from '../api/auth';

// const AuthContext = createContext(null);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null); // { id, username, isAdmin }
//   const [token, setToken] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const savedToken = localStorage.getItem('jwt');
//     const savedUser = localStorage.getItem('user');
//     if (savedToken && savedUser) {
//       setToken(savedToken);
//       try {
//         setUser(JSON.parse(savedUser));
//       } catch {
//         setUser(null);
//       }
//     }
//     setLoading(false);
//   }, []);

//   const login = async (username, password) => {
//     const { token: jwt, user: userInfo } = await loginApi(username, password);
//     setToken(jwt);
//     setUser(userInfo);
//     localStorage.setItem('jwt', jwt);
//     localStorage.setItem('user', JSON.stringify(userInfo));
//   };

//   const logout = () => {
//     setToken(null);
//     setUser(null);
//     localStorage.removeItem('jwt');
//     localStorage.removeItem('user');
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         loading,
//         isAuthenticated: !!token,
//         isAdmin: user?.isAdmin,
//         login,
//         logout
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);
