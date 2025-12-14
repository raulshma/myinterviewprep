'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, ArrowRight, Code2, AlertTriangle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type DIPattern = 
  | 'constructor-injection' 
  | 'service-locator' 
  | 'tight-coupling' 
  | 'options-pattern'
  | 'factory-pattern';

export interface DIPatternShowcaseProps {
  pattern?: DIPattern;
  mode?: 'beginner' | 'intermediate' | 'advanced';
  title?: string;
}

interface PatternExample {
  title: string;
  description: string;
  badCode: string;
  badExplanation: string;
  goodCode: string;
  goodExplanation: string;
  tip: string;
}

const patterns: Record<DIPattern, PatternExample> = {
  'constructor-injection': {
    title: 'Constructor Injection',
    description: 'Dependencies are explicit and required through the constructor.',
    badCode: `public class UserService
{
    public void CreateUser(string email)
    {
        // Bad: Creates its own dependency!
        var emailService = new SmtpEmailService();
        emailService.Send(email, "Welcome!");
        
        // Tight coupling, hard to test
        var db = new SqlDatabase("connection...");
        db.Insert(new User { Email = email });
    }
}`,
    badExplanation: 'Creates dependencies internally with "new" - impossible to mock or replace',
    goodCode: `public class UserService
{
    private readonly IEmailService _emailService;
    private readonly IUserRepository _repository;
    
    // Good: Dependencies injected via constructor
    public UserService(
        IEmailService emailService,
        IUserRepository repository)
    {
        _emailService = emailService;
        _repository = repository;
    }
    
    public void CreateUser(string email)
    {
        _repository.Add(new User { Email = email });
        _emailService.Send(email, "Welcome!");
    }
}`,
    goodExplanation: 'Dependencies are explicit, injectable, and mockable for testing',
    tip: 'Make dependencies readonly fields - they should not change after construction!',
  },
  'service-locator': {
    title: 'Service Locator Anti-Pattern',
    description: 'Avoid using IServiceProvider directly in your application code.',
    badCode: `public class OrderService
{
    private readonly IServiceProvider _provider;
    
    public OrderService(IServiceProvider provider)
    {
        _provider = provider;
    }
    
    public void ProcessOrder(Order order)
    {
        // Bad: Service Locator pattern!
        var emailService = _provider
            .GetRequiredService<IEmailService>();
        var paymentService = _provider
            .GetRequiredService<IPaymentService>();
        
        // Hidden dependencies - not visible in constructor
        paymentService.Charge(order);
        emailService.SendReceipt(order);
    }
}`,
    badExplanation: 'Dependencies are hidden, making testing and understanding harder',
    goodCode: `public class OrderService
{
    private readonly IEmailService _emailService;
    private readonly IPaymentService _paymentService;
    
    // Good: All dependencies visible in constructor
    public OrderService(
        IEmailService emailService,
        IPaymentService paymentService)
    {
        _emailService = emailService;
        _paymentService = paymentService;
    }
    
    public void ProcessOrder(Order order)
    {
        _paymentService.Charge(order);
        _emailService.SendReceipt(order);
    }
}`,
    goodExplanation: 'Dependencies are explicit and visible - easy to test and maintain',
    tip: 'The only place IServiceProvider should be used is in factories or the composition root!',
  },
  'tight-coupling': {
    title: 'Loose Coupling with Interfaces',
    description: 'Depend on abstractions (interfaces), not concrete implementations.',
    badCode: `public class ReportGenerator
{
    // Bad: Depends on concrete class!
    private readonly SqlServerDatabase _db;
    
    public ReportGenerator()
    {
        _db = new SqlServerDatabase();
    }
    
    public Report Generate()
    {
        var data = _db.ExecuteQuery("SELECT...");
        return new Report(data);
    }
}

// Cannot switch to PostgreSQL without
// changing ReportGenerator!`,
    badExplanation: 'Tightly coupled to SQL Server - changing database requires code changes',
    goodCode: `public class ReportGenerator
{
    // Good: Depends on interface!
    private readonly IDatabase _db;
    
    public ReportGenerator(IDatabase db)
    {
        _db = db;
    }
    
    public Report Generate()
    {
        var data = _db.ExecuteQuery("SELECT...");
        return new Report(data);
    }
}

// Registration:
// services.AddScoped<IDatabase, SqlServerDb>();
// Or swap to: PostgreSqlDb, MySqlDb, etc.`,
    goodExplanation: 'Loosely coupled via interface - swap implementations without code changes',
    tip: 'Use interfaces for anything that might change: databases, APIs, file systems, etc.',
  },
  'options-pattern': {
    title: 'Options Pattern for Configuration',
    description: 'Use IOptions<T> for strongly-typed configuration settings.',
    badCode: `public class EmailService
{
    private readonly IConfiguration _config;
    
    public EmailService(IConfiguration config)
    {
        _config = config;
    }
    
    public void Send(string to, string body)
    {
        // Bad: Magic strings everywhere!
        var host = _config["Email:SmtpHost"];
        var port = int.Parse(_config["Email:Port"]);
        var from = _config["Email:FromAddress"];
        
        // No validation, no IntelliSense
        // Easy to misspell key names
    }
}`,
    badExplanation: 'Magic strings, no type safety, no IntelliSense, easy to make typos',
    goodCode: `public class EmailOptions
{
    public string SmtpHost { get; set; } = "";
    public int Port { get; set; } = 587;
    public string FromAddress { get; set; } = "";
}

public class EmailService
{
    private readonly EmailOptions _options;
    
    public EmailService(IOptions<EmailOptions> options)
    {
        _options = options.Value;
    }
    
    public void Send(string to, string body)
    {
        // Good: Strongly typed!
        Connect(_options.SmtpHost, _options.Port);
        SendFrom(_options.FromAddress, to, body);
    }
}

// Registration:
// services.Configure<EmailOptions>(
//     config.GetSection("Email"));`,
    goodExplanation: 'Strongly typed, IntelliSense support, validated at startup',
    tip: 'Use IOptionsSnapshot<T> for reloadable configs, IOptionsMonitor<T> for reactive updates!',
  },
  'factory-pattern': {
    title: 'Factory Pattern with DI',
    description: 'Use factories when you need to create instances at runtime.',
    badCode: `public class NotificationService
{
    public void Notify(string channel, Message msg)
    {
        // Bad: Switch statement with "new"
        INotifier notifier;
        switch (channel)
        {
            case "email":
                notifier = new EmailNotifier();
                break;
            case "sms":
                notifier = new SmsNotifier();
                break;
            case "push":
                notifier = new PushNotifier();
                break;
            default:
                throw new Exception("Unknown");
        }
        
        notifier.Send(msg);
    }
}`,
    badExplanation: 'Hard to test, extend, or inject dependencies into notifiers',
    goodCode: `public interface INotifierFactory
{
    INotifier Create(string channel);
}

public class NotifierFactory : INotifierFactory
{
    private readonly IServiceProvider _provider;
    
    public NotifierFactory(IServiceProvider provider)
    {
        _provider = provider;
    }
    
    public INotifier Create(string channel) =>
        channel switch
        {
            "email" => _provider
                .GetRequiredService<EmailNotifier>(),
            "sms" => _provider
                .GetRequiredService<SmsNotifier>(),
            _ => throw new Exception("Unknown")
        };
}

public class NotificationService
{
    private readonly INotifierFactory _factory;
    
    public NotificationService(INotifierFactory factory)
    {
        _factory = factory;
    }
    
    public void Notify(string channel, Message msg)
    {
        var notifier = _factory.Create(channel);
        notifier.Send(msg);
    }
}`,
    goodExplanation: 'Factories are the RIGHT place to use IServiceProvider',
    tip: 'Register factories as Singleton - they just create instances, not hold state!',
  },
};

export function DIPatternShowcase({
  pattern = 'constructor-injection',
  mode = 'beginner',
  title,
}: DIPatternShowcaseProps) {
  const [showGood, setShowGood] = useState(false);
  const example = patterns[pattern];

  return (
    <Card className="my-6 overflow-hidden bg-gray-950 border-gray-800">
      <CardHeader className="pb-3 bg-gray-900/50">
        <CardTitle className="text-sm font-medium text-gray-200 flex items-center gap-2">
          <Code2 className="h-4 w-4 text-blue-400" />
          {title || example.title}
        </CardTitle>
        <p className="text-xs text-gray-500 mt-1">{example.description}</p>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Toggle */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={!showGood ? "default" : "outline"}
            onClick={() => setShowGood(false)}
            className={cn(
              "text-xs",
              !showGood && "bg-red-600 hover:bg-red-700"
            )}
          >
            <XCircle className="h-3 w-3 mr-1" />
            Bad Practice
          </Button>
          <ArrowRight className="h-4 w-4 text-gray-500" />
          <Button
            size="sm"
            variant={showGood ? "default" : "outline"}
            onClick={() => setShowGood(true)}
            className={cn(
              "text-xs",
              showGood && "bg-green-600 hover:bg-green-700"
            )}
          >
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Best Practice
          </Button>
        </div>

        {/* Code Display */}
        <motion.div
          key={showGood ? 'good' : 'bad'}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'rounded-lg border-2 overflow-hidden',
            showGood 
              ? 'border-green-500/50 bg-green-500/5' 
              : 'border-red-500/50 bg-red-500/5'
          )}
        >
          {/* Header */}
          <div className={cn(
            'flex items-center gap-2 px-4 py-2',
            showGood ? 'bg-green-500/20' : 'bg-red-500/20'
          )}>
            {showGood ? (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            ) : (
              <XCircle className="h-4 w-4 text-red-400" />
            )}
            <span className={cn(
              'text-xs font-medium',
              showGood ? 'text-green-400' : 'text-red-400'
            )}>
              {showGood ? 'Recommended Approach' : 'Anti-Pattern'}
            </span>
          </div>

          {/* Code */}
          <pre className="p-4 text-xs font-mono overflow-x-auto bg-gray-900/80">
            <code className="text-gray-300">
              {showGood ? example.goodCode : example.badCode}
            </code>
          </pre>

          {/* Explanation */}
          <div className={cn(
            'px-4 py-3 border-t',
            showGood 
              ? 'border-green-500/30 bg-green-500/10' 
              : 'border-red-500/30 bg-red-500/10'
          )}>
            <div className="flex items-start gap-2">
              {showGood ? (
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
              )}
              <p className={cn(
                'text-xs',
                showGood ? 'text-green-300' : 'text-red-300'
              )}>
                {showGood ? example.goodExplanation : example.badExplanation}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tip */}
        {mode !== 'beginner' && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-300">
              <span className="font-medium">Pro Tip:</span> {example.tip}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DIPatternShowcase;
