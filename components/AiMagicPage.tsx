import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { analyzeImage, generateImage, groundedSearch, generateSpeech } from '../services/geminiService';
import { SparklesIcon } from './Icons';

type AiTool = 'image-gen' | 'image-inspect' | 'research';

const AiMagicPage = () => {
    const [activeTool, setActiveTool] = useState<AiTool>('image-gen');

    const ToolButton = ({ tool, label }: { tool: AiTool; label: string }) => (
        <button
            onClick={() => setActiveTool(tool)}
            className={`px-4 py-2 rounded-full font-semibold transition ${activeTool === tool ? 'bg-primary text-white' : 'bg-white hover:bg-gray-100 text-dark'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="p-8">
            <div className="flex items-center space-x-4 mb-8">
                <SparklesIcon className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold text-dark">AI Magic Tools</h1>
            </div>

            <div className="flex space-x-2 p-1 bg-gray-200 rounded-full mb-8 max-w-md">
                <ToolButton tool="image-gen" label="Image Generator" />
                <ToolButton tool="image-inspect" label="Image Inspector" />
                <ToolButton tool="research" label="Research Assistant" />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg">
                {activeTool === 'image-gen' && <ImageGenerator />}
                {activeTool === 'image-inspect' && <ImageInspector />}
                {activeTool === 'research' && <ResearchAssistant />}
            </div>
        </div>
    );
};

const ImageGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [image, setImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt) return;
        setIsLoading(true);
        setError('');
        setImage(null);
        try {
            const generatedImage = await generateImage(prompt, aspectRatio);
            setImage(generatedImage);
        } catch (err) {
            setError('Failed to generate image. Please try a different prompt.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-dark mb-4">Image Generator</h2>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A vibrant painting of a student teaching a group of children under a large tree."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
            <div className="flex items-center justify-between my-4">
                <div className="flex items-center space-x-4">
                    <label className="font-semibold">Aspect Ratio:</label>
                    {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
                        <label key={ratio} className="flex items-center space-x-1 cursor-pointer">
                            <input
                                type="radio"
                                name="aspectRatio"
                                value={ratio}
                                checked={aspectRatio === ratio}
                                onChange={(e) => setAspectRatio(e.target.value)}
                                className="h-4 w-4 text-primary focus:ring-primary"
                            />
                            <span>{ratio}</span>
                        </label>
                    ))}
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition disabled:opacity-50"
                >
                    {isLoading ? 'Generating...' : 'Generate Image'}
                </button>
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {image && (
                <div className="text-center">
                    <img src={image} alt="Generated" className="rounded-lg max-w-full md:max-w-xl mx-auto shadow-md" />
                    <a href={image} download={`generated-image-${Date.now()}.png`} className="inline-block mt-4 bg-primary text-white font-semibold px-5 py-2 rounded-full hover:bg-opacity-90">
                        Download Image
                    </a>
                </div>
            )}
        </div>
    );
};

const ImageInspector = () => {
    const [prompt, setPrompt] = useState('Describe this image in detail.');
    const [image, setImage] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setAnalysis('');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleAnalyze = async () => {
        if (!image) return;
        setIsLoading(true);
        setAnalysis('');
        try {
            const result = await analyzeImage(image, prompt);
            setAnalysis(result);
        } catch (err) {
            setAnalysis('Failed to analyze image.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-dark mb-4">Image Inspector</h2>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
            {image && (
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <img src={image} alt="Upload preview" className="rounded-lg w-full" />
                    </div>
                    <div>
                        <textarea
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg mb-2"
                        />
                        <button onClick={handleAnalyze} disabled={isLoading} className="w-full bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition disabled:opacity-50">
                             {isLoading ? 'Analyzing...' : 'Analyze Image'}
                        </button>
                        {analysis && <div className="mt-4 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">{analysis}</div>}
                    </div>
                </div>
            )}
        </div>
    );
};

const ResearchAssistant = () => {
    const [query, setQuery] = useState('');
    const [result, setResult] = useState<{ text: string; sources: any[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearch = async () => {
        if (!query) return;
        setIsLoading(true);
        setResult(null);
        try {
            const searchResult = await groundedSearch(query);
            setResult(searchResult);
        } catch (err) {
            setResult({ text: 'An error occurred during search.', sources: [] });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
             <h2 className="text-2xl font-bold text-dark mb-4">Research Assistant</h2>
             <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a question about recent events or topics..."
                    className="flex-grow p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch} disabled={isLoading || !query} className="bg-secondary text-dark font-bold px-6 py-3 rounded-full shadow-lg hover:opacity-90 transition disabled:opacity-50">
                    {isLoading ? 'Searching...' : 'Search'}
                </button>
             </div>
             {result && (
                <div className="mt-6">
                    <div className="prose max-w-none p-4 bg-gray-50 rounded-lg" dangerouslySetInnerHTML={{ __html: marked(result.text) }}></div>
                    {result.sources.length > 0 && (
                        <div className="mt-4">
                            <h3 className="font-semibold">Sources:</h3>
                            <ul className="list-disc list-inside">
                                {result.sources.map((source, index) => (
                                    <li key={index}>
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{source.title || source.uri}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
             )}
        </div>
    )
}

export default AiMagicPage;