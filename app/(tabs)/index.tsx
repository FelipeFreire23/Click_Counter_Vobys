/**
 * Click Counter Vobys
 * 
 * Uma aplicação React Native para contar cliques e gerenciar histórico
 * com funcionalidades de exportação em múltiplos formatos.
 * 
 * Arquitetura:
 * - Estado centralizado com hooks
 * - Persistência local com AsyncStorage
 * - Navegação por tabs no header
 * - Exportação de dados em TXT, CSV e XLSX
 * - Suporte a dark mode
 * 
 * @author Felipe de Oliveira Freire
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Alert,
  SafeAreaView,
  Share,
  ScrollView,
  Switch,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { writeAsStringAsync, documentDirectory } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

// ===========================
// CONSTANTES E CONFIGURAÇÕES
// ===========================

/**
 * Chave para persistência no AsyncStorage
 * Prefixo @ é uma convenção para evitar conflitos
 */
const STORAGE_KEY = '@clicks';

/**
 * URL do logo da empresa
 * Centralizada para facilitar manutenção
 */
const COMPANY_LOGO_URL = 'https://c5gwmsmjx1.execute-api.us-east-1.amazonaws.com/prod/dados_processo_seletivo/logo_empresa/187443/____IDV_VOBYS-Final-28.png';

/**
 * Páginas disponíveis na aplicação
 * Enum-like object para type safety
 */
const PAGES = {
  COUNTER: 'counter',
  HISTORY: 'history',
  SETTINGS: 'settings'
};

// ===========================
// COMPONENTE PRINCIPAL
// ===========================

export default function App() {
  // ===========================
  // ESTADO DA APLICAÇÃO
  // ===========================
  
  /**
   * Contador total de cliques
   * @type {number}
   */
  const [clickCount, setClickCount] = useState(0);
  
  /**
   * Histórico de cliques com timestamps
   * Array ordenado do mais recente para o mais antigo
   * @type {number[]}
   */
  const [clickHistory, setClickHistory] = useState([]);
  
  /**
   * Página atual sendo exibida
   * @type {string}
   */
  const [currentPage, setCurrentPage] = useState(PAGES.COUNTER);
  
  /**
   * Estado do modo escuro
   * @type {boolean}
   */
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ===========================
  // LIFECYCLE HOOKS
  // ===========================
  
  /**
   * Effect para carregar dados salvos na inicialização
   * Executa apenas uma vez no mount do componente
   */
  useEffect(() => {
    loadData();
  }, []);

  // ===========================
  // FUNÇÕES DE PERSISTÊNCIA
  // ===========================
  
  /**
   * Salva dados no AsyncStorage
   * 
   * @param {number} count - Contador de cliques
   * @param {number[]} history - Array de timestamps
   * @param {boolean} darkMode - Estado do dark mode
   */
  const saveData = async (count, history, darkMode) => {
    try {
      const data = {
        count: count !== undefined ? count : clickCount,
        history: history !== undefined ? history : clickHistory,
        darkMode: darkMode !== undefined ? darkMode : isDarkMode
      };
      
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      // Em produção, aqui poderíamos enviar para um serviço de logging
    }
  };

  /**
   * Carrega dados do AsyncStorage
   * Inicializa com valores padrão se não houver dados salvos
   */
  const loadData = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (data) {
        const parsed = JSON.parse(data);
        setClickCount(parsed.count || 0);
        setClickHistory(parsed.history || []);
        setIsDarkMode(parsed.darkMode || false);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Falha silenciosa - mantém valores padrão
    }
  };

  // ===========================
  // UTILITÁRIOS
  // ===========================
  
  /**
   * Formata timestamp para exibição em português brasileiro
   * 
   * @param {number} timestamp - Timestamp em millisegundos
   * @returns {string} Data formatada
   */
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  };

  /**
   * Retorna o tema atual baseado no modo escuro
   * 
   * @returns {Object} Objeto com cores do tema
   */
  const getTheme = () => {
    return {
      background: isDarkMode ? '#121212' : '#f5f5f5',
      card: isDarkMode ? '#1f1f1f' : 'white',
      text: isDarkMode ? '#fff' : '#333',
      textSecondary: isDarkMode ? '#ccc' : '#666',
      border: isDarkMode ? '#333' : '#ddd',
    };
  };

  // ===========================
  // HANDLERS DE EVENTOS
  // ===========================
  
  /**
   * Registra um novo clique
   * Atualiza contador e adiciona timestamp ao histórico
   */
  const handleClick = () => {
    const now = Date.now();
    const newCount = clickCount + 1;
    const newHistory = [now, ...clickHistory]; // Prepend para manter ordem cronológica inversa
    
    setClickCount(newCount);
    setClickHistory(newHistory);
    saveData(newCount, newHistory);
  };

  /**
   * Compartilha histórico via menu nativo do sistema
   * Usa a API Share do React Native
   */
  const exportHistory = () => {
    if (clickHistory.length === 0) {
      Alert.alert('Aviso', 'Nenhum clique para exportar');
      return;
    }

    const text = generateTextContent();
    
    Share.share({
      message: text,
      title: 'Histórico de Cliques'
    });
  };

  /**
   * Limpa todo o histórico após confirmação
   * Implementa padrão de confirmação destrutiva
   */
  const clearHistory = () => {
    Alert.alert(
      'Limpar Histórico',
      'Isso vai apagar todos os cliques. Confirma?',
      [
        { 
          text: 'Cancelar', 
          style: 'cancel' 
        },
        {
          text: 'Apagar',
          style: 'destructive',
          onPress: () => {
            setClickCount(0);
            setClickHistory([]);
            saveData(0, []);
            Alert.alert('Sucesso', 'Histórico limpo!');
          }
        }
      ]
    );
  };

  /**
   * Alterna modo escuro e persiste a preferência
   * 
   * @param {boolean} value - Novo estado do dark mode
   */
  const toggleDarkMode = (value) => {
    setIsDarkMode(value);
    saveData(undefined, undefined, value);
  };

  // ===========================
  // FUNÇÕES DE EXPORTAÇÃO
  // ===========================
  
  /**
   * Gera conteúdo em texto formatado
   * 
   * @returns {string} Conteúdo formatado para exportação
   */
  const generateTextContent = () => {
    let content = `Histórico de Cliques - Total: ${clickCount}\n`;
    content += `Gerado em: ${formatDateTime(Date.now())}\n`;
    content += '========================================\n\n';
    
    clickHistory.forEach((time, index) => {
      content += `${index + 1}. ${formatDateTime(time)}\n`;
    });
    
    return content;
  };

  /**
   * Cria e compartilha arquivo em formato TXT
   * Usa sistema de arquivos temporário do Expo
   */
  const downloadTXT = async () => {
    if (clickHistory.length === 0) {
      Alert.alert('Aviso', 'Nenhum clique para baixar');
      return;
    }

    try {
      const content = generateTextContent();
      await createAndShareFile(content, 'txt', 'text/plain', 'Salvar arquivo TXT');
    } catch (error) {
      console.error('Erro no download TXT:', error);
      Alert.alert('Erro', 'Falha ao baixar TXT');
    }
  };

  /**
   * Cria e compartilha arquivo em formato CSV
   * Formato compatível com Excel e Google Sheets
   */
  const downloadCSV = async () => {
    if (clickHistory.length === 0) {
      Alert.alert('Aviso', 'Nenhum clique para baixar');
      return;
    }

    try {
      let csvContent = 'Numero,Data,Hora\n';
      
      clickHistory.forEach((time, index) => {
        const date = new Date(time);
        const dateStr = date.toLocaleDateString('pt-BR');
        const timeStr = date.toLocaleTimeString('pt-BR');
        // Aspas duplas para escapar vírgulas nos dados
        csvContent += `${index + 1},"${dateStr}","${timeStr}"\n`;
      });

      await createAndShareFile(csvContent, 'csv', 'text/csv', 'Salvar arquivo CSV');
    } catch (error) {
      console.error('Erro no download CSV:', error);
      Alert.alert('Erro', 'Falha ao baixar CSV');
    }
  };

  /**
   * Cria e compartilha arquivo em formato XLSX (compatível com Excel)
   * Usa BOM UTF-8 e separador ponto-e-vírgula (padrão brasileiro)
   */
  const downloadXLSX = async () => {
    if (clickHistory.length === 0) {
      Alert.alert('Aviso', 'Nenhum clique para baixar');
      return;
    }

    try {
      // BOM (Byte Order Mark) para garantir encoding UTF-8 no Excel
      let content = '\uFEFF';
      content += 'Numero;Data;Hora\n';
      
      clickHistory.forEach((time, index) => {
        const date = new Date(time);
        const dateStr = date.toLocaleDateString('pt-BR');
        const timeStr = date.toLocaleTimeString('pt-BR');
        // Ponto-e-vírgula é o separador padrão para região brasileira
        content += `${index + 1};${dateStr};${timeStr}\n`;
      });

      await createAndShareFile(
        content, 
        'xlsx', 
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
        'Salvar arquivo Excel'
      );
    } catch (error) {
      console.error('Erro no download XLSX:', error);
      Alert.alert('Erro', 'Falha ao baixar XLSX');
    }
  };

  /**
   * Função auxiliar para criar e compartilhar arquivos
   * Centraliza a lógica de criação de arquivos temporários
   * 
   * @param {string} content - Conteúdo do arquivo
   * @param {string} extension - Extensão do arquivo
   * @param {string} mimeType - MIME type para o sistema
   * @param {string} dialogTitle - Título do diálogo de compartilhamento
   */
  const createAndShareFile = async (content, extension, mimeType, dialogTitle) => {
    const fileName = `historico_cliques_${Date.now()}.${extension}`;
    const fileUri = documentDirectory + fileName;
    
    await writeAsStringAsync(fileUri, content);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType,
        dialogTitle
      });
    } else {
      throw new Error('Compartilhamento não disponível');
    }
  };

  // ===========================
  // COMPONENTES DE UI
  // ===========================
  
  const theme = getTheme();

  /**
   * Header com logo e navegação por tabs
   * Componente reutilizável para o cabeçalho
   */
  const Header = () => (
    <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
      <Image 
        source={{ uri: COMPANY_LOGO_URL }}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <View style={styles.headerTabs}>
        {Object.values(PAGES).map(page => (
          <TouchableOpacity 
            key={page}
            style={[styles.tab, currentPage === page && styles.tabActive]}
            onPress={() => setCurrentPage(page)}
          >
            <Text style={[
              styles.tabText, 
              { color: theme.text }, 
              currentPage === page && styles.tabTextActive
            ]}>
              {getPageTitle(page)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  /**
   * Retorna título traduzido da página
   * 
   * @param {string} page - Identificador da página
   * @returns {string} Título da página
   */
  const getPageTitle = (page) => {
    const titles = {
      [PAGES.COUNTER]: 'Contador',
      [PAGES.HISTORY]: 'Histórico',
      [PAGES.SETTINGS]: 'Config'
    };
    return titles[page] || page;
  };

  /**
   * Página do contador principal
   * Interface para registrar novos cliques
   */
  const CounterPage = () => (
    <ScrollView style={[styles.page, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Click Counter</Text>
        <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>
          Clique no botão para contar
        </Text>
      </View>

      <View style={[styles.counterBox, { backgroundColor: theme.card }]}>
        <TouchableOpacity 
          style={styles.clickButton} 
          onPress={handleClick}
          activeOpacity={0.7} // Feedback visual no toque
        >
          <Text style={styles.clickText}>CLIQUE AQUI</Text>
        </TouchableOpacity>
        
        <Text style={styles.countNumber}>{clickCount}</Text>
        <Text style={[styles.countLabel, { color: theme.textSecondary }]}>
          {clickCount === 1 ? 'clique' : 'cliques'}
        </Text>
      </View>
    </ScrollView>
  );

  /**
   * Página do histórico com lista de cliques e opções de exportação
   * Implementa lista virtualizada para performance com muitos itens
   */
  const HistoryPage = () => (
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Histórico</Text>
        <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>
          Total: {clickCount} cliques
        </Text>
      </View>

      {/* Seção de ações principais */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.button} onPress={exportHistory}>
          <Text style={styles.buttonText}>Compartilhar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={clearHistory}>
          <Text style={styles.buttonText}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {/* Seção de downloads */}
      <View style={styles.downloadSection}>
        <Text style={[styles.downloadTitle, { color: theme.text }]}>Baixar como:</Text>
        <View style={styles.downloadButtons}>
          <TouchableOpacity style={[styles.downloadBtn, styles.txtButton]} onPress={downloadTXT}>
            <Text style={styles.downloadBtnText}>TXT</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.downloadBtn, styles.csvButton]} onPress={downloadCSV}>
            <Text style={styles.downloadBtnText}>CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.downloadBtn, styles.xlsxButton]} onPress={downloadXLSX}>
            <Text style={styles.downloadBtnText}>XLSX</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista do histórico ou estado vazio */}
      {clickHistory.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Nenhum clique ainda
          </Text>
        </View>
      ) : (
        <FlatList
          data={clickHistory}
          keyExtractor={(item, index) => `${item}-${index}`} // Chave única
          renderItem={({ item, index }) => (
            <View style={[styles.historyItem, { backgroundColor: theme.card }]}>
              <Text style={styles.historyNumber}>#{clickCount - index}</Text>
              <Text style={[styles.historyTime, { color: theme.text }]}>
                {formatDateTime(item)}
              </Text>
            </View>
          )}
          // Otimizações de performance para listas grandes
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={20}
        />
      )}
    </View>
  );

  /**
   * Página de configurações
   * Interface para ajustes do aplicativo
   */
  const SettingsPage = () => (
    <ScrollView style={[styles.page, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.pageTitle, { color: theme.text }]}>Configurações</Text>
        <Text style={[styles.pageSubtitle, { color: theme.textSecondary }]}>

        </Text>
      </View>

      {/* Toggle do modo escuro */}
      <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
        <Text style={[styles.settingLabel, { color: theme.text }]}>Modo Escuro</Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleDarkMode}
          trackColor={{ false: '#ddd', true: '#4CAF50' }}
          thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
        />
      </View>

      {/* Informações do app */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.infoTitle, { color: theme.text }]}>Informações</Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          Cliques: {clickCount}
        </Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          Salvamento automático
        </Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          Versão 1.0
        </Text>
      </View>
    </ScrollView>
  );

  /**
   * Renderiza a página atual baseada no estado
   * Pattern de routing simples sem bibliotecas externas
   * 
   * @returns {JSX.Element} Componente da página atual
   */
  const renderPage = () => {
    switch (currentPage) {
      case PAGES.COUNTER: 
        return <CounterPage />;
      case PAGES.HISTORY: 
        return <HistoryPage />;
      case PAGES.SETTINGS: 
        return <SettingsPage />;
      default: 
        return <CounterPage />;
    }
  };

  // ===========================
  // RENDER PRINCIPAL
  // ===========================
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header />
      {renderPage()}
    </SafeAreaView>
  );
}

// ===========================
// ESTILOS
// ===========================

/**
 * StyleSheet com padrões de design system
 * Organizado por seções para facilitar manutenção
 */
const styles = StyleSheet.create({
  // Layout base
  container: {
    flex: 1,
  },
  page: {
    flex: 1,
    padding: 20,
  },
  
  // Header e navegação
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 15,
  paddingVertical: 30, // Para um header ainda mais alto
  borderBottomWidth: 1,
},
  logo: {
    width: 60,
    height: 60,
  },
  
  headerTabs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginLeft: 15,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: 'white',
  },
  
  // Cards e containers
  card: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  
  // Tipografia
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
  
  // Área do contador
  counterBox: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 10,
  },
  clickButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 20,
    borderRadius: 50,
    marginBottom: 30,
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // Sombra para Android
    elevation: 5,
  },
  clickText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  countNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  countLabel: {
    fontSize: 16,
  },
  
  // Botões de ação
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 8,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  dangerButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Seção de downloads
  downloadSection: {
    marginTop: 10,
    marginBottom: 15,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  downloadButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  downloadBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  txtButton: {
    backgroundColor: '#9C27B0',
  },
  csvButton: {
    backgroundColor: '#FF9800',
  },
  xlsxButton: {
    backgroundColor: '#4CAF50',
  },
  downloadBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Lista do histórico
  historyItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  historyNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    width: 50,
  },
  historyTime: {
    fontSize: 16,
    flex: 1,
  },
  
  // Estado vazio
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
  },
  
  // Configurações
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
  },
});