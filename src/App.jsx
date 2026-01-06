import React, { useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import { BookOpen, ChevronDown, ChevronUp, FileText, Download, Trash2, Info, X } from 'lucide-react';

// 默认配置
const DEFAULT_CONFIG = {
  appTitle: "舆情发展五阶段案例分析报告",
  stages: [],
  roles: [],
  civicQuestions: []
};

const App = () => {
  // --- 状态管理 ---
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState(null); 
  const [showReference, setShowReference] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [civicExpanded, setCivicExpanded] = useState(false);

  const [formData, setFormData] = useState({
    groupName: '',
    members: '',
    role: '',
    stages: {}, 
    overallSuggestion: '',
    civicReflection: ''
  });

  // --- 初始化与持久化 ---
  useEffect(() => {
    fetch('/config.json')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load config", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem('publicOpinionAnalysisData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('publicOpinionAnalysisData', JSON.stringify(formData));
  }, [formData]);

  // --- 事件处理 ---
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStageChange = (stageId, field, value) => {
    setFormData(prev => ({
      ...prev,
      stages: {
        ...prev.stages,
        [stageId]: {
          ...prev.stages[stageId],
          [field]: value
        }
      }
    }));
  };

  const handleReset = () => {
    if (window.confirm('确定要清空所有内容吗？此操作无法撤销。')) {
      setFormData({
        groupName: '',
        members: '',
        role: '',
        stages: {},
        overallSuggestion: '',
        civicReflection: ''
      });
      localStorage.removeItem('publicOpinionAnalysisData');
    }
  };

  const toggleStage = (id) => {
    if (activeStage === id) {
      setActiveStage(null);
      setShowReference(false);
    } else {
      setActiveStage(id);
    }
  };

  const openReference = (e) => {
    e.stopPropagation();
    setShowReference(true);
  };

  const handleExportPDF = () => {
    const element = document.getElementById('report-content');
    const opt = {
      margin: 10,
      filename: `${formData.groupName || '小组'}_舆情分析报告.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading) return <div className="flex justify-center items-center h-screen">加载配置中...</div>;

  // --- 预览/导出 视图 ---
  if (previewMode) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 flex flex-col items-center">
        <div className="fixed top-4 right-4 flex gap-2 z-50">
          <button 
            onClick={handleExportPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2"
          >
            <Download size={18} /> 导出 PDF
          </button>
          <button 
            onClick={() => setPreviewMode(false)}
            className="bg-gray-600 text-white px-4 py-2 rounded shadow hover:bg-gray-700 flex items-center gap-2"
          >
            <X size={18} /> 返回编辑
          </button>
        </div>

        <div id="report-content" className="pdf-page bg-white p-10 max-w-3xl w-full shadow-lg text-gray-800">
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-2xl font-bold mb-2">{config.appTitle}</h1>
            <h2 className="text-xl text-gray-600">{config.subTitle}</h2>
          </div>

          <div className="mb-6 bg-gray-50 p-4 rounded border border-gray-200 text-sm">
            <p><strong>小组名称：</strong> {formData.groupName || '未填写'}</p>
            <p><strong>小组成员：</strong> {formData.members || '未填写'}</p>
            <p><strong>扮演角色：</strong> {formData.role || '未选择'}</p>
          </div>

          <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-2 mb-4">第一部分：五阶段分析与对策</h3>
          {config.stages.map(stage => (
            <div key={stage.id} className="mb-6">
              <h4 className="font-bold text-gray-700 mb-1">Phase {config.stages.indexOf(stage) + 1}: {stage.name}</h4>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-blue-50 p-3 rounded text-sm">
                  <span className="font-semibold text-blue-800">阶段特点/表现：</span>
                  <p className="whitespace-pre-wrap mt-1">{formData.stages[stage.id]?.analysis || '（未填写）'}</p>
                </div>
                <div className="bg-green-50 p-3 rounded text-sm">
                  <span className="font-semibold text-green-800">角色对策：</span>
                  <p className="whitespace-pre-wrap mt-1">{formData.stages[stage.id]?.countermeasure || '（未填写）'}</p>
                </div>
              </div>
            </div>
          ))}

          <h3 className="text-lg font-bold border-l-4 border-purple-600 pl-2 mb-4 mt-8">第二部分：基于{formData.role || '角色'}立场的总体建议</h3>
          <div className="mb-6 text-sm p-4 border border-gray-200 rounded whitespace-pre-wrap">
            {formData.overallSuggestion || '（未填写）'}
          </div>

          <h3 className="text-lg font-bold border-l-4 border-red-600 pl-2 mb-4 mt-8">第三部分：启示与思政思考</h3>
          <div className="mb-6 text-sm p-4 border border-gray-200 rounded whitespace-pre-wrap">
            {formData.civicReflection || '（未填写）'}
          </div>
          
          <div className="text-center text-xs text-gray-400 mt-10 pt-4 border-t">
            生成时间：{new Date().toLocaleString()}
          </div>
        </div>
      </div>
    );
  }

  // --- 编辑/主界面 视图 ---
  return (
    <div className="min-h-screen flex flex-col md:flex-row max-w-6xl mx-auto bg-white shadow-2xl my-4 rounded-lg overflow-hidden border border-gray-200">
      
      <div className="flex-1 p-8 overflow-y-auto relative">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800">{config.appTitle}</h1>
          <div className="flex items-center gap-2 text-gray-500 mt-2">
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Case Study</span>
            <h2 className="text-lg font-medium">{config.subTitle}</h2>
          </div>
        </header>

        <section className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">小组名称</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="例如：飞跃小组"
              value={formData.groupName}
              onChange={(e) => handleInputChange('groupName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">小组成员</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="张三, 李四..."
              value={formData.members}
              onChange={(e) => handleInputChange('members', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">扮演角色</label>
            <select 
              className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
            >
              <option value="">-- 请选择 --</option>
              {config.roles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm">1</span>
            舆情五阶段分析
          </h3>
          
          <div className="space-y-4">
            {config.stages.map((stage, index) => {
              const isOpen = activeStage === stage.id;
              const hasData = formData.stages[stage.id]?.analysis || formData.stages[stage.id]?.countermeasure;

              return (
                <div key={stage.id} className={`border rounded-lg transition-all duration-200 ${isOpen ? 'ring-2 ring-blue-100 border-blue-300' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div 
                    className="flex justify-between items-center p-4 cursor-pointer bg-white rounded-t-lg select-none"
                    onClick={() => toggleStage(stage.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${isOpen ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                      <div>
                        <h4 className="font-bold text-gray-700">{stage.name}</h4>
                        <p className="text-xs text-gray-400">{stage.definition}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {hasData && !isOpen && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">已填写</span>}
                      {isOpen && (
                        <button 
                          onClick={openReference}
                          className="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 flex items-center gap-1 transition-colors mr-2"
                        >
                          <BookOpen size={14} /> 参考资料
                        </button>
                      )}
                      {isOpen ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                    </div>
                  </div>

                  {isOpen && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-4 animation-fade-in">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">阶段特点分析 (结合案例)</label>
                        <textarea 
                          className="w-full p-3 border rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24"
                          placeholder="描述该阶段在“西贝事件”中的具体表现..."
                          value={formData.stages[stage.id]?.analysis || ''}
                          onChange={(e) => handleStageChange(stage.id, 'analysis', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          对策与措施 (角色：{formData.role || '未选择'})
                        </label>
                        <textarea 
                          className="w-full p-3 border rounded text-sm focus:ring-2 focus:ring-green-500 outline-none h-24"
                          placeholder={`作为${formData.role || '该角色'}，在${stage.name}应采取什么措施？`}
                          value={formData.stages[stage.id]?.countermeasure || ''}
                          onChange={(e) => handleStageChange(stage.id, 'countermeasure', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm">2</span>
            总体建议与措施
          </h3>
          <div className="p-5 border rounded-lg bg-white shadow-sm">
            <p className="text-sm text-gray-500 mb-3 bg-purple-50 p-2 rounded">
              <Info size={14} className="inline mr-1"/>
              请跳出五阶段的框架，从您所扮演的角色（{formData.role || '当前角色'}）整体出发，阐述在整个事件中应如何系统性应对。
            </p>
            <textarea 
              className="w-full p-4 border rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none h-40 leading-relaxed"
              placeholder="在此撰写总体建议..."
              value={formData.overallSuggestion}
              onChange={(e) => handleInputChange('overallSuggestion', e.target.value)}
            />
          </div>
        </section>

        <section className="mb-20">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-sm">3</span>
            作为未来信息把关人的启示
          </h3>
          <div className="p-5 border rounded-lg bg-white shadow-sm">
            <button 
              onClick={() => setCivicExpanded(!civicExpanded)}
              className="text-sm text-red-600 font-medium mb-3 flex items-center gap-1 hover:underline"
            >
              {civicExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>} 
              {civicExpanded ? '收起引导性问题' : '查看引导性问题'}
            </button>
            
            {civicExpanded && (
               <ul className="list-disc list-inside text-sm text-gray-600 mb-4 bg-red-50 p-3 rounded">
                 {config.civicQuestions.map((q, i) => <li key={i}>{q}</li>)}
               </ul>
            )}
            
            <textarea 
              className="w-full p-4 border rounded text-sm focus:ring-2 focus:ring-red-500 outline-none h-40 leading-relaxed"
              placeholder="在此撰写您的思考与启示..."
              value={formData.civicReflection}
              onChange={(e) => handleInputChange('civicReflection', e.target.value)}
            />
          </div>
        </section>

        <div className="sticky bottom-0 bg-white/90 backdrop-blur border-t p-4 flex justify-between items-center -mx-8 px-8">
          <button 
            onClick={handleReset}
            className="text-gray-500 text-sm flex items-center gap-1 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} /> 清空重置
          </button>
          <button 
            onClick={() => setPreviewMode(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-transform active:scale-95 flex items-center gap-2 font-medium"
          >
            <FileText size={18} /> 一键生成报告
          </button>
        </div>
      </div>

      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-40 border-l border-gray-200 p-6 overflow-y-auto ${showReference && activeStage ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <BookOpen size={18} /> 参考资料
          </h3>
          <button onClick={() => setShowReference(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        {activeStage && (
          <div className="prose prose-sm prose-blue">
            <h4 className="font-bold text-blue-600 mb-2">
              {config.stages.find(s => s.id === activeStage)?.name}
            </h4>
            <div className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm bg-yellow-50 p-4 rounded border border-yellow-200">
              {config.stages.find(s => s.id === activeStage)?.reference}
            </div>
            <p className="mt-4 text-xs text-gray-400">
              *此资料仅供参考，请结合课堂讲解进行分析。
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default App;
