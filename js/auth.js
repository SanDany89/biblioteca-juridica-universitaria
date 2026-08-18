/**
 * auth.js - Sistema de Gestión de Usuarios y Roles (Estudiante / Administrador)
 */

class AuthManager {
  constructor() {
    this.STORAGE_KEY = 'bju_current_user';
    this.listeners = [];
    this.currentUser = this.loadUser();
  }

  loadUser() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parseando usuario:', e);
      }
    }
    // Usuario por defecto: Estudiante
    return {
      role: 'student', // 'student' | 'admin'
      name: 'Estudiante Universitario',
      email: 'estudiante.derecho@universidad.edu.mx',
      avatar: '🎓',
      matricula: 'DER-2024-889'
    };
  }

  saveUser() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.currentUser));
    this.notifyListeners();
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAdmin() {
    return this.currentUser.role === 'admin';
  }

  isStudent() {
    return this.currentUser.role === 'student';
  }

  setRole(role) {
    if (role === 'admin') {
      this.currentUser = {
        role: 'admin',
        name: 'Lic. Administrador de la Biblioteca',
        email: 'admin.biblioteca@derecho.edu.mx',
        avatar: '⚖️',
        cargo: 'Comité Editorial y Moderación Jurídica'
      };
    } else {
      this.currentUser = {
        role: 'student',
        name: 'Estudiante de Derecho',
        email: 'estudiante.derecho@universidad.edu.mx',
        avatar: '🎓',
        matricula: 'DER-2024-889'
      };
    }
    this.saveUser();
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    // Ejecutar inmediatamente
    callback(this.currentUser);
  }

  notifyListeners() {
    this.listeners.forEach(cb => {
      try {
        cb(this.currentUser);
      } catch (e) {
        console.error('Error en listener de auth:', e);
      }
    });
  }
}

export const auth = new AuthManager();
