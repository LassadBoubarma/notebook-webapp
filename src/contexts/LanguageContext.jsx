import React, { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    // ---------- Dashboard ----------
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome!',
    'dashboard.practice.title': 'Quick practice',
    'dashboard.stats.lessons': 'Lessons completed',
    'dashboard.stats.streak': 'Consecutive days',
    'dashboard.stats.score': 'Total score',
    'dashboard.lessons.title': 'Available lessons',
    'dashboard.lesson.start': 'Start',
    'dashboard.lesson.locked': 'Locked',
    'dashboard.quickActions': 'Quick actions',
    'dashboard.short.notebook': 'Save phrases & vocabulary',
    'dashboard.short.basic': 'Canvas · images · pen',
    'dashboard.short.logout': 'Sign out of your account',
    'dashboard.btn.notebook': 'Notebook',
    'dashboard.btn.basic': 'Basic notebook',
    'dashboard.btn.logout': 'Logout',
    // language switch
    'site.language': 'Language',
    'site.language.en': 'English',
    'site.language.pt': 'Português',

    // ---------- Lessons cards ----------
    'lesson.salutations.title': 'Salutations',
    'lesson.salutations.desc': 'Learn the basics of politeness',
    'lesson.pronouns.title': 'Personal pronouns',
    'lesson.pronouns.desc': 'Eu, tu, ele, ela… and verb conjugation',
    'lesson.numbers.title': 'Numbers',
    'lesson.numbers.desc': 'Count, understand, say numbers from 0 to 1 billion',

    // ---------- Notebook (UI) ----------
    'notebook.title': 'Notebook',
    'notebook.navHome': 'Home',
    'notebook.navBasic': 'Basic Note',
    'notebook.myNotes': 'My notes',
    'notebook.studyLanguage': 'Study language',
    'notebook.filterPlaylist': 'Filter by playlist',
    'notebook.allNotes': 'All notes',
    'notebook.playlists': 'Playlists',
    'notebook.newPlaylist': 'New playlist',
    'notebook.create': 'Create',
    'notebook.addNote': 'Add note',
    'notebook.noteTitle': 'Note title',
    'notebook.noteContent': 'Note content',
    'notebook.add': 'Add',
    'notebook.default': 'Default',
    'notebook.delete': 'Delete',
    'notebook.quiz': 'Quiz',
    'notebook.addTo': 'Add to…',
    'notebook.noNotes': 'No notes',
    'notebook.voice': 'Voice',
    'notebook.video': 'Video',
    'notebook.image': 'Image',
    'notebook.close': 'Close',
    'hint.attachInEdit': 'Uploaded media is inserted in the text. Click Save to keep it.',


    //Basic Note 
    'basicNote.title': 'Basic Note',
    'cancel': 'Cancel',     
    'edit': 'Edit',
    'save': 'Save',  
    
    "username": {
      "title": "Choose your username",
      "subtitle": "This will be the name others see",
      "label": "Username",
      "placeholder": "Enter your username",
      "required": "Username is required",
      "tooShort": "Username must be at least 3 characters",
      "tooLong": "Username cannot exceed 20 characters",
      "taken": "This username is already taken",
      "generate": "Generate a random name",
      "suggestions": "Suggestions",
      "creating": "Creating...",
      "continue": "Continue",
      "rules": "Use only letters, numbers, and underscores. Between 3 and 20 characters."
    }
  },

  pt: {
    // ---------- Dashboard ----------
    'dashboard.title': 'Painel',
    'dashboard.welcome': 'Bem-vindo!!',
    'dashboard.practice.title': 'Prática rápida',
    'dashboard.stats.lessons': 'Lições completadas',
    'dashboard.stats.streak': 'Dias consecutivos',
    'dashboard.stats.score': 'Pontuação total',
    'dashboard.lessons.title': 'Lições disponíveis',
    'dashboard.lesson.start': 'Começar',
    'dashboard.lesson.locked': 'Bloqueado',
    'dashboard.quickActions': 'Ações rápidas',
    'dashboard.short.notebook': 'Guarde frases e vocabulário',
    'dashboard.short.basic': 'Canvas · imagens · caneta',
    'dashboard.short.logout': 'Sair da sua conta',
    'dashboard.btn.notebook': 'Caderno',
    'dashboard.btn.basic': 'Caderno simples',
    'dashboard.btn.logout': 'Sair',
    // language switch
    'site.language': 'Idioma',
    'site.language.en': 'English',
    'site.language.pt': 'Português',

    // ---------- Lessons cards ----------
    'lesson.salutations.title': 'Saudações',
    'lesson.salutations.desc': 'Aprenda as bases da cortesia',
    'lesson.pronouns.title': 'Pronomes pessoais',
    'lesson.pronouns.desc': 'Eu, tu, ele, ela… e conjugação verbal',
    'lesson.numbers.title': 'Números',
    'lesson.numbers.desc': 'Contar, entender, dizer os números de 0 a 1 bilhão',

    // ---------- Notebook (UI) ----------
    'notebook.title': 'Caderno de anotações',
    'notebook.navHome': 'Início',
    'notebook.navBasic': 'Caderno simples',
    'notebook.myNotes': 'Minhas notas',
    'notebook.studyLanguage': 'Idioma de estudo',
    'notebook.filterPlaylist': 'Filtrar por playlist',
    'notebook.allNotes': 'Todas as notas',
    'notebook.playlists': 'Listas de reprodução',
    'notebook.newPlaylist': 'Nova lista',
    'notebook.create': 'Criar',
    'notebook.addNote': 'Adicionar nota',
    'notebook.noteTitle': 'Título da nota',
    'notebook.noteContent': 'Conteúdo da nota',
    'notebook.add': 'Adicionar',
    'notebook.default': 'Padrão',
    'notebook.delete': 'Excluir',
    'notebook.quiz': 'Quiz',
    'notebook.addTo': 'Adicionar a…',
    'notebook.noNotes': 'Sem notas',
    'notebook.voice': 'Áudio',
    'notebook.video': 'Vídeo',
    'notebook.image': 'Imagem',
    'notebook.close': 'Fechar',
    'hint.attachInEdit': 'O arquivo enviado é inserido no texto. Clique em Salvar para manter.',


    //---------------Basic Note----------
    'basicNote.title': 'caderno simples',
    'cancel' : 'Cancelar',
    'edit' : 'Editar',
    'save' : 'Salvar',

    "username": {
      "title": "Escolha seu nome de usuário",
      "subtitle": "Este será o nome que os outros verão",
      "label": "Nome de usuário",
      "placeholder": "Digite seu nome de usuário",
      "required": "O nome de usuário é obrigatório",
      "tooShort": "O nome de usuário deve ter pelo menos 3 caracteres",
      "tooLong": "O nome de usuário não pode ter mais de 20 caracteres",
      "taken": "Este nome de usuário já está em uso",
      "generate": "Gerar um nome aleatório",
      "suggestions": "Sugestões",
      "creating": "Criando...",
      "continue": "Continuar",
      "rules": "Use apenas letras, números e sublinhados. Entre 3 e 20 caracteres."
    }
  },
};

// helper: support "dotted" keys like "notebook.add"
function getByPath(obj, path) {
  return path.split('.').reduce((o, k) => (o != null ? o[k] : undefined), obj);
}

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('pt'); // default if you prefer

  useEffect(() => {
    const saved = localStorage.getItem('preferredLanguage');
    if (saved && translations[saved]) setCurrentLanguage(saved);
  }, []);

  const t = (key) => {
    const dict = translations[currentLanguage] || {};
    return getByPath(dict, key) ?? dict[key] ?? key;
  };

  const changeLanguage = (lang) => {
    if (!translations[lang]) return;
    setCurrentLanguage(lang);
    localStorage.setItem('preferredLanguage', lang);
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
};

// Adapter pour les anciens fichiers qui appellent useLang()
export const useLang = () => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const toDb = (c) => (c === 'pt' ? 'pt-BR' : 'en');
  const fromDb = (c) => (c === 'pt-BR' ? 'pt' : c || 'en');
  return { lang: toDb(currentLanguage), setLang: (dbCode) => changeLanguage(fromDb(dbCode)) };
};
