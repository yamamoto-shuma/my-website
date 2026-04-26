import { useState, useCallback } from 'react';
import type { Question, ResultItem } from '../types/quiz';
import ServiceSelector from '../components/ServiceSelector';
import QuizCard from '../components/QuizCard';
import Result from '../components/Result';

import vpcQuestions from '../data/questions/vpc.json';
import iamQuestions from '../data/questions/iam.json';
import kmsQuestions from '../data/questions/kms.json';
import ec2Questions from '../data/questions/ec2.json';
import autoscalingQuestions from '../data/questions/autoscaling.json';
import ebsQuestions from '../data/questions/ebs.json';
import ecsQuestions from '../data/questions/ecs.json';
import lambdaQuestions from '../data/questions/lambda.json';
import albNlbQuestions from '../data/questions/alb-nlb.json';
import route53Questions from '../data/questions/route53.json';
import cloudfrontQuestions from '../data/questions/cloudfront.json';
import apiGatewayQuestions from '../data/questions/api-gateway.json';
import s3Questions from '../data/questions/s3.json';
import efsQuestions from '../data/questions/efs.json';
import auroraQuestions from '../data/questions/aurora.json';
import dynamodbQuestions from '../data/questions/dynamodb.json';

const PHASE_GROUPS = [
  { phase: 1, label: 'Phase 1 — セキュリティ・ネットワーク基礎', services: ['VPC', 'IAM', 'KMS'] },
  { phase: 2, label: 'Phase 2 — コンピューティング', services: ['EC2', 'Auto Scaling', 'EBS', 'ECS', 'Lambda'] },
  { phase: 3, label: 'Phase 3 — ネットワーキング・配信', services: ['ALB/NLB', 'Route 53', 'CloudFront', 'API Gateway'] },
  { phase: 4, label: 'Phase 4 — ストレージ・データベース', services: ['S3', 'EFS', 'Aurora', 'DynamoDB'] },
];

const ALL_QUESTIONS: Question[] = [
  ...(vpcQuestions as Question[]),
  ...(iamQuestions as Question[]),
  ...(kmsQuestions as Question[]),
  ...(ec2Questions as Question[]),
  ...(autoscalingQuestions as Question[]),
  ...(ebsQuestions as Question[]),
  ...(ecsQuestions as Question[]),
  ...(lambdaQuestions as Question[]),
  ...(albNlbQuestions as Question[]),
  ...(route53Questions as Question[]),
  ...(cloudfrontQuestions as Question[]),
  ...(apiGatewayQuestions as Question[]),
  ...(s3Questions as Question[]),
  ...(efsQuestions as Question[]),
  ...(auroraQuestions as Question[]),
  ...(dynamodbQuestions as Question[]),
];

const ALL_SERVICES = PHASE_GROUPS.flatMap((g) => g.services);

type Phase = 'selecting' | 'quizzing' | 'result';

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function AwsQuiz() {
  const [phase, setPhase] = useState<Phase>('selecting');
  const [selectedServices, setSelectedServices] = useState<string[]>(ALL_SERVICES);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<ResultItem[]>([]);

  const filteredCount = ALL_QUESTIONS.filter((q) => selectedServices.includes(q.service)).length;

  const startQuiz = useCallback(() => {
    const pool = ALL_QUESTIONS.filter((q) => selectedServices.includes(q.service));
    setQuestions(shuffle(pool));
    setCurrentIndex(0);
    setResults([]);
    setPhase('quizzing');
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

  if (phase === 'selecting') {
    return (
      <ServiceSelector
        phaseGroups={PHASE_GROUPS}
        selected={selectedServices}
        onChange={setSelectedServices}
        onStart={startQuiz}
        questionCount={filteredCount}
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
