/**
 * auth.js - Sistema de Autenticación y Control de Roles con Supabase Auth
 * Proporciona inicio de sesión seguro para Administradores y acceso libre a Estudiantes.
 */

import { getSupabase } from './supabase-config.js';

class AuthManager {
  constructor() {
    this.listeners = [];
    this.currentUser = this.getDefaultGuestUser();
    this.initAuth();
  }

  getDefaultGuestUser() {
    return {
      role: 'student',
      name: 'Estudiante / Visitante',
      email: null,
      isAdmin: false,
      avatar: '🎓'
    };
  }

  async initAuth() {
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      // 1. Verificar sesión existente en Supabase Auth
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && session.user) {
        this.setUserFromSession(session.user);
      } else {
        this.currentUser = this.getDefaultGuestUser();
      }
      this.notifyListeners();

      // 2. Escuchar cambios de estado en tiempo real (Login, Logout, Token Refresh)
      supabase.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
          this.setUserFromSession(session.user);
        } else {
          this.currentUser = this.getDefaultGuestUser();
        }
        this.notifyListeners();
      });
    } catch (err) {
      console.warn('Error inicializando Supabase Auth:', err);
    }
  }

  setUserFromSession(user) {
    this.currentUser = {
      role: 'admin',
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Administrador',
      email: user.email,
      id: user.id,
      isAdmin: true,
      avatar: '⚖️',
      cargo: 'Administrador de la Biblioteca'
    };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAdmin() {
    return Boolean(this.currentUser && this.currentUser.role === 'admin' && this.currentUser.email);
  }

  isStudent() {
    return !this.isAdmin();
  }

  /**
   * Iniciar sesión de administrador mediante Supabase Auth
   */
  async login(email, password) {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error('El cliente de Supabase no está disponible.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password
    });

    if (error) {
      console.error('Error en Supabase login:', error);
      throw error;
    }

    if (data.session && data.user) {
      this.setUserFromSession(data.user);
      this.notifyListeners();
      return { success: true, user: this.currentUser };
    }

    throw new Error('No se pudo establecer la sesión de administrador.');
  }

  /**
   * Cerrar sesión de administrador
   */
  async logout() {
    const supabase = getSupabase();
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Error cerrando sesión en Supabase:', err);
      }
    }

    this.currentUser = this.getDefaultGuestUser();
    this.notifyListeners();
    return { success: true };
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    // Ejecutar callback inmediatamente con el estado actual
    try {
      callback(this.currentUser);
    } catch (e) {
      console.error('Error en callback de auth:', e);
    }
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
