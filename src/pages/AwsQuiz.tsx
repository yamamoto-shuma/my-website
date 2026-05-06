import { useState, useCallback } from 'react';
import type { Question, ResultItem } from '../types/quiz';
import ServiceSelector from '../components/ServiceSelector';
import QuizCard from '../components/QuizCard';
import Result from '../components/Result';

const PHASE_GROUPS = [
  { phase: 1, label: 'Phase 1 — セキュリティ・ネットワーク基礎', services: ['VPC', 'IAM', 'KMS'] },
  { phase: 2, label: 'Phase 2 — コンピューティング', services: ['EC2', 'Auto Scaling', 'EBS', 'ECS', 'Lambda'] },
  { phase: 3, label: 'Phase 3 — ネットワーキング・配信', services: ['ALB/NLB', 'Route 53', 'CloudFront', 'API Gateway'] },
  { phase: 4, label: 'Phase 4 — ストレージ・データベース', services: ['S3', 'EFS', 'Aurora', 'DynamoDB'] },
  { phase: 5, label: 'Phase 5 — セキュリティ運用・モニタリング', services: ['WAF', 'Secrets Manager', 'CloudWatch', 'CloudTrail'] },
  { phase: 6, label: 'Phase 6 — メッセージング・統合', services: ['SQS', 'SNS', 'EventBridge', 'Step Functions'] },
];

const SERVICE_FILE_MAP: Record<string, string> = {
  'VPC': 'vpc',
  'IAM': 'iam',
  'KMS': 'kms',
  'EC2': 'ec2',
  'Auto Scaling': 'autoscaling',
  'EBS': 'ebs',
  'ECS': 'ecs',
  'Lambda': 'lambda',
  'ALB/NLB': 'alb-nlb',
  'Route 53': 'route53',
  'CloudFront': 'cloudfront',
  'API Gateway': 'api-gateway',
  'S3': 's3',
  'EFS': 'efs',
  'Aurora': 'aurora',
  'DynamoDB': 'dynamodb',
  'WAF': 'waf',
  'Secrets Manager': 'secrets-manager',
  'CloudWatch': 'cloudwatch',
  'CloudTrail': 'cloudtrail',
  'SQS': 'sqs',
  'SNS': 'sns',
  'EventBridge': 'eventbridge',
  'Step Functions': 'step-functions',
};

const ALL_SERVICES = PHASE_GROUPS.flatMap((g) => g.services);

type Phase = 'selecting' | 'loading' | 'quizzing' | 'result';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

async function fetchQuestions(services: string[]): Promise<Question[]> {
  const results = await Promise.all(
    services.map(async (service) => {
      const file = SERVICE_FILE_MAP[service];
      if (!file) throw new Error(`SERVICE_FILE_MAP にサービス "${service}" の定義がありません`);
      const res = await fetch(`/data/questions/${file}.json`);
      if (!res.ok) throw new Error(`Failed to fetch ${file}.json: ${res.status}`);
      return res.json() as Promise<Question[]>;
    })
  );
  return results.flat();
}

function AwsQuiz() {
  const [phase, setPhase] = useState<Phase>('selecting');
  const [selectedServices, setSelectedServices] = useState<string[]>(ALL_SERVICES);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startQuiz = useCallback(async () => {
    setError(null);
    setPhase('loading');
    try {
      const fetched = await fetchQuestions(selectedServices);
      setQuestions(shuffle(fetched));
      setCurrentIndex(0);
      setResults([]);
      setPhase('quizzing');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'データ取得に失敗しました');
      setPhase('selecting');
    }
  }, [selectedServices]);

  const handleNext = (correct: boolean) => {
    const updated = [...results, { question: questions[currentIndex], correct }];
    setResults(updated);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setPhase('result');
    }
  };

  const handleRetry = () => {
    setQuestions(shuffle(questions));
    setCurrentIndex(0);
    setResults([]);
    setPhase('quizzing');
  };

  const handleBackToTop = () => {
    setPhase('selecting');
  };

  if (phase === 'loading') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 18, color: '#5F6B7A' }}>問題を読み込み中...</div>
      </div>
    );
  }

  if (phase === 'selecting') {
    return (
      <ServiceSelector
        phaseGroups={PHASE_GROUPS}
        selected={selectedServices}
        onChange={setSelectedServices}
        onStart={startQuiz}
        error={error}
      />
    );
  }

  if (phase === 'quizzing') {
    return (
      <QuizCard
        key={currentIndex}
        question={questions[currentIndex]}
        current={currentIndex + 1}
        total={questions.length}
        onNext={handleNext}
        onBack={handleBackToTop}
      />
    );
  }

  return <Result results={results} onRetry={handleRetry} onBackToTop={handleBackToTop} />;
}

export default AwsQuiz;
