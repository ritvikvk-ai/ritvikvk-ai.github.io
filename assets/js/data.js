/* Site content. Edit here to update skills, projects and education. */
window.RVK_DATA = {
  links: {
    email: 'rv2459@nyu.edu',
    github: 'https://github.com/ritvikvk-ai',
    linkedin: 'https://linkedin.com/in/ritvik-vk'
  },
  roles: ['AI Engineer', 'Computer Vision Engineer', 'ML Engineer', 'Multi-Agent Systems Builder', 'Applied AI'],
  skills: [
    { k: 'ai_ml', n: 'AI / ML', sub: 'LLMs · deep learning', c: '#5ad8ff',
      items: ['PyTorch', 'TensorFlow', 'Keras', 'Scikit-Learn', 'LangGraph', 'RAG', 'LLaMA 3', 'Multi-Agent Systems', 'HuggingFace Transformers', 'Gemini API', 'Anthropic LLMs', 'Google ADK'] },
    { k: 'computer_vision', n: 'Computer Vision', sub: 'perception', c: '#c8ff2e',
      items: ['OWLv2', 'SAM', 'RF-DETR', 'BEVFormer', 'OpenCV', 'FFmpeg', 'Instance Segmentation', 'Object Tracking'] },
    { k: 'cloud_mlops', n: 'Cloud & MLOps', sub: 'infra', c: '#ffb000',
      items: ['Azure', 'Azure OpenAI', 'GCP', 'Vertex AI', 'AWS', 'Docker', 'CI/CD', 'Databricks', 'ZenML', 'ClearML'] },
    { k: 'languages', n: 'Languages', sub: 'core', c: '#ff4fa3',
      items: ['Python', 'SQL', 'JavaScript', 'C++', 'Java', 'C', 'HTML', 'CSS'] },
    { k: 'data_engineering', n: 'Data Engineering', sub: 'pipelines', c: '#a78bfa',
      items: ['Spark', 'Hadoop', 'PostgreSQL', 'MongoDB', 'Qdrant', 'Weaviate', 'Pandas', 'NumPy', 'Databricks SQL'] },
    { k: 'frontend_tools', n: 'Frontend & Tools', sub: 'product', c: '#2fd67b',
      items: ['React', 'FastAPI', 'Gradio', 'Power BI', 'Tableau', 'Bootstrap', 'GitHub', 'VSCode'] }
  ],
  /* pairs of tools used together — drawn as extra links in the skill graph */
  related: [
    ['RAG', 'Qdrant'], ['RAG', 'Weaviate'], ['LangGraph', 'Anthropic LLMs'], ['Google ADK', 'Gemini API'], ['Gemini API', 'Vertex AI'],
    ['PyTorch', 'RF-DETR'], ['PyTorch', 'SAM'], ['OWLv2', 'HuggingFace Transformers'], ['OpenCV', 'FFmpeg'], ['Object Tracking', 'OpenCV'],
    ['Instance Segmentation', 'SAM'], ['Python', 'PyTorch'], ['Python', 'Pandas'], ['FastAPI', 'Python'], ['Docker', 'CI/CD'],
    ['Azure OpenAI', 'Azure'], ['Databricks', 'Spark'], ['Databricks SQL', 'Databricks'], ['LLaMA 3', 'HuggingFace Transformers'],
    ['React', 'JavaScript'], ['Gradio', 'Python'], ['Multi-Agent Systems', 'LangGraph'], ['BEVFormer', 'PyTorch'], ['SQL', 'PostgreSQL']
  ],
  projects: [
    { hash: 'a3f9c21', org: 'HOF Capital Hacks', title: 'Agentic AI Code Assistant', lbl: 'agent_system', conf: .98, viz: 'agents',
      desc: 'Multi-agent system automating the full SDLC: research, generation, review, testing and security analysis. Specialized agents hand off via LangGraph, with Anthropic LLMs and GitHub MCP orchestrating end-to-end.',
      tags: ['LangGraph', 'Anthropic', 'GitHub MCP', 'Docker', 'CI/CD'], link: 'https://github.com/ritvikvk-ai/remote-dev-ai', m: ['status', 'shipped'] },
    { hash: '7be0d14', org: 'NYU × Gemini Hackathon', title: 'LORE: Multimodal Story Engine', lbl: 'multimodal', conf: .97, viz: 'voice',
      desc: 'Synchronized text, image and voice generation with Gemini 2.5 Pro and Google ADK. Agent-to-agent pipelines, context-aware narrative branching and real-time voice I/O via the Gemini Live API.',
      tags: ['Gemini 2.5 Pro', 'Google ADK', 'Vertex AI', 'FastAPI', 'React'], link: 'https://github.com/ritvikvk-ai/LORE', m: ['status', 'shipped'] },
    { hash: 'c40e8aa', org: 'AI Research', title: 'Fine-Tuned RAG for Robotics', lbl: 'rag_robotics', conf: .96, viz: 'robot',
      desc: 'Domain-specific RAG over ROS2 Navigation docs. LLaMA 3 fine-tuned on a robotics corpus with Qdrant retrieval, served via Ollama + Gradio with higher precision and lower latency.',
      tags: ['LLaMA 3', 'Qdrant', 'ROS2', 'Ollama'], link: 'https://github.com/ritvikvk-ai/ai_project', m: ['status', 'shipped'] },
    { hash: '19d2f7e', org: 'Microsoft Hack Night 2025', title: 'Weaviate RAG Chatbot', lbl: 'rag_chatbot', conf: .95, viz: 'vectors',
      desc: 'Enterprise knowledge assistant with Weaviate as the vector backbone: ingestion, embedding retrieval and context-grounded generation designed to minimise hallucination.',
      tags: ['RAG', 'Weaviate', 'FastAPI', 'LLM'], m: ['status', 'shipped'] },
    { hash: 'e81b3c0', org: 'Financial ML', title: 'Insider Trading Detection', lbl: 'anomaly', conf: .85, viz: 'candles',
      desc: 'LSTM sequence model flagging suspicious trading patterns across large-scale market records for compliance and market surveillance.',
      tags: ['LSTM', 'TensorFlow', 'Keras', 'Time Series'], m: ['accuracy', '~85%'] },
    { hash: '5aa07f9', org: 'Best Project of the Year', title: 'Image-to-Text Conversion', lbl: 'caption', conf: .95, viz: 'caption',
      desc: 'Image captioning with Inception-v3 visual features and an LSTM decoder. Awarded Best Project of the Year.',
      tags: ['Inception-v3', 'LSTM', 'Computer Vision', 'PyTorch'], m: ['accuracy', '~95%'] }
  ],
  edu: [
    { when: 'Graduated May 2026', school: 'New York University', sub: 'Tandon School of Engineering · MS Computer Science · New York, NY',
      body: 'Machine learning · AI · deep learning · algorithms · database systems · robotics AI · cloud-based AI systems.', g: 'GPA 3.7 / 4.0' },
    { when: 'Graduated', school: 'NMAM Institute of Technology, VTU', sub: 'BE Computer Science · Karnataka, India',
      body: 'ML · NLP · cybersecurity · big data analytics · computer architecture · data structures.', g: 'CGPA 8.89 / 10' }
  ]
};
