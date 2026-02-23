// P&C Demo Data - Winter Storm Scenario
// Primary scenario: Kim Lee, Bloom & Petals Florist, Portland winter storm pipe burst

const pcDemoData = [
  {
    id: 'pc-claim-001',
    claimNumber: 'CLM-2026-089432',
    type: 'commercial_property',
    lineOfBusiness: 'property_casualty',
    subType: 'water_damage',
    status: 'approved',
    priority: 'high',
    approvedAt: '2026-02-10T08:15:00Z',
    approvalMethod: 'STP - Straight-Through Processing',
    claimant: {
      firstName: 'Kim',
      lastName: 'Lee',
      businessName: 'Bloom & Petals Florist',
      email: 'kim@bloomandpetals.com',
      phone: '(555) 234-8890',
      dateOfBirth: '1982-03-15'
    },

    // Loss Event (P&C equivalent of death event)
    lossEvent: {
      eventType: 'winter_storm',
      lossDate: '2026-02-10T03:15:00Z',
      reportedDate: '2026-02-10T07:30:00Z',
      causeOfLoss: 'Water Damage - Frozen Pipe Burst',
      location: {
        address: 'Bloom & Petals - Basement Storage',
        city: 'Portland',
        state: 'OR',
        zip: '97214',
        coordinates: { lat: 45.5152, lon: -122.6784 }
      },
      weatherData: {
        temperature: '-5°F',
        conditions: 'Winter Storm Warning',
        windSpeed: '25 mph',
        source: 'NOAA Weather Service',
        alertLevel: 'severe'
      },
      iotSensorData: [
        {
          sensorId: 'TEMP-BPF-001',
          type: 'temperature',
          reading: '-5°F',
          timestamp: '2026-02-10T02:30:00Z',
          alert: 'Critical temperature drop detected',
          status: 'active'
        },
        {
          sensorId: 'WATER-BPF-002',
          type: 'water_leak',
          reading: 'Active leak detected',
          timestamp: '2026-02-10T03:15:00Z',
          alert: 'Water sensor detected leak at 3:15 AM and sent alert',
          status: 'active'
        },
        {
          sensorId: 'HUMID-BPF-003',
          type: 'humidity',
          reading: '85%',
          timestamp: '2026-02-10T04:00:00Z',
          alert: 'Abnormal humidity spike',
          status: 'active'
        }
      ]
    },

    // Property Damage Assessment
    propertyDamage: {
      affectedAreas: ['Basement Storage', 'Walk-in Cooler', 'Storefront Display', 'Delivery Van Area'],
      damageCategories: [
        {
          category: 'Inventory Loss',
          severity: 'Critical',
          description: 'Complete loss of refrigerated flower inventory',
          estimatedCost: 12000
        },
        {
          category: 'Structural Damage',
          severity: 'Major',
          description: 'Water damage from pipe burst in basement affecting walls and flooring',
          estimatedCost: 7500
        }
      ],
      totalEstimatedLoss: 19500,
      capturedAreas: [
        { area: 'Storefront Display', status: 'captured', timestamp: '2026-02-10T07:30:00Z' },
        { area: 'Walk-in Cooler', status: 'captured', timestamp: '2026-02-10T07:32:00Z' },
        { area: 'Basement Water Pipes', status: 'captured', timestamp: '2026-02-10T07:35:00Z' },
        { area: 'Delivery Van', status: 'captured', timestamp: '2026-02-10T07:38:00Z' }
      ],
      photos: [
        { url: '/images/storefront-display.jpg', caption: 'Storefront Display', timestamp: '2026-02-10T07:30:00Z' },
        { url: '/images/walk-in-cooler.jpg', caption: 'Walk-in Cooler', timestamp: '2026-02-10T07:32:00Z' },
        { url: '/images/basement-pipes.jpg', caption: 'Basement Water Pipes', timestamp: '2026-02-10T07:35:00Z' },
        { url: '/images/delivery-van.jpg', caption: 'Delivery Van', timestamp: '2026-02-10T07:38:00Z' }
      ]
    },

    // Intelligent FNOL (First Notice of Loss)
    intelligentFNOL: {
      aiRecommendedActions: [
        'STP Approved - Emergency water mitigation pre-authorized',
        'Payment scheduled for ACH transfer',
        'Post-settlement audit recommended'
      ],
      riskScore: 8,
      fraudIndicators: [],
      fraudReasoning: 'IoT sensor validation, weather data correlation, timely reporting, prior claim compliance, and proactive prevention measures support claim authenticity. All STP criteria met.',
      autoApproval: true,
      requiresAdjuster: false,
      straightThroughProcessing: true,
      stpEligible: true,
      stpConfidenceScore: 94,
      claimComplexity: 'simple',
      stpCriteria: [
        {
          criterion: 'Storm Alert Sent',
          met: true,
          details: 'Winter storm alert sent 48 hours before incident',
          timestamp: '2026-02-08T03:15:00Z'
        },
        {
          criterion: 'Risk Documentation',
          met: true,
          details: 'Property photos documented vulnerable pipe locations',
          priorClaimRef: 'CLM-2024-012847'
        },
        {
          criterion: 'Smart Monitoring',
          met: true,
          details: 'Water sensor detected leak at 3:15 AM and sent alert',
          sensorVerified: true
        },
        {
          criterion: 'Prevention Compliance',
          met: true,
          details: 'Followed recommended prevention checklist',
          complianceScore: 100
        },
        {
          criterion: 'Rapid Response',
          met: true,
          details: 'Emergency mitigation began within 2 hours',
          responseTime: '1 hour 45 minutes'
        }
      ]
    },

    // Proactive Alerts
    proactiveAlerts: [
      {
        type: 'temperature_warning',
        timestamp: '2026-02-10T02:30:00Z',
        message: 'Critical temperature drop detected at insured location',
        severity: 'high',
        actionTaken: 'Automated notification sent to insured'
      },
      {
        type: 'weather_advisory',
        timestamp: '2026-02-08T03:15:00Z',
        message: 'Winter storm alert sent 48 hours before incident',
        severity: 'high',
        actionTaken: 'Preventive measures advisory sent'
      }
    ],

    routing: {
      type: 'fasttrack',
      method: 'STP - Straight-Through Processing',
      reason: 'IoT-verified, prevention compliance, prior good history, all 5 STP criteria met',
      score: 94,
      eligible: true
    },

    // Financial/Reserve Management (P&C specific)
    financial: {
      claimAmount: 19500,
      initialReserve: 20000,
      currentReserve: 0,
      policyLimit: 500000,
      deductible: 5000,
      businessInterruptionClaim: 0,
      totalExposure: 19500,
      paidToDate: 19500,
      reserveAdequacy: 'closed',
      lastReserveUpdate: '2026-02-10T14:00:00Z',
      payments: [
        {
          id: 'PAY-001-001',
          amount: 19500,
          payee: 'Bloom & Petals Florist',
          status: 'Approved',
          date: '2026-02-10',
          approvalDate: '2026-02-10T08:15:00Z',
          type: 'STP Auto-Approval',
          method: 'ACH Transfer',
          scheduledDate: '2026-02-12',
          note: 'Fast-tracked due to IoT verification and prevention compliance'
        }
      ]
    },

    policy: {
      policyNumber: 'BOP-CO-789456',
      policyType: 'Business Owners Policy',
      carrier: 'Assure Insurance Group',
      effectiveDate: '2023-06-01',
      expirationDate: '2026-06-01',
      premium: 4500,
      coverages: [
        { type: 'Property Damage', limit: 500000, deductible: 5000 },
        { type: 'Business Interruption', limit: 100000, waitingPeriod: '48 hours' },
        { type: 'Equipment Breakdown', limit: 50000, deductible: 1000 }
      ]
    },

    workflow: {
      currentStage: 'approved',
      processingType: 'STP - Straight-Through Processing',
      assignedTo: 'Jennifer Torres',
      assignedDate: '2026-02-10T08:15:00Z',
      approvedDate: '2026-02-10T08:15:00Z',
      approvalDuration: '45 minutes',
      humanReviewRequired: false,
      postApprovalAudit: 'Scheduled',
      sla: {
        responseTime: '< 1 hour',
        resolutionTime: '< 1 day',
        currentStatus: 'exceeded_target',
        targetMet: true
      }
    },

    aiInsights: {
      claimSummary: 'Commercial property claim for winter storm-related frozen pipe burst at Bloom & Petals Florist basement. IoT sensors validated freezing conditions and water leak at 3:15 AM. Weather data confirms severe winter storm. Low fraud risk with straightforward causation. All 5 STP criteria met.',
      recommendedActions: [
        'STP Auto-Approval - All criteria met',
        'Payment authorized via ACH',
        'Post-settlement audit scheduled',
        'Adjuster Jennifer Torres assigned'
      ],
      similarClaims: 3,
      averageSettlementTime: '< 1 day',
      settlementPrediction: '$19,500'
    },

    documents: [
      { id: 'doc-001', type: 'FNOL', name: 'First Notice of Loss', uploadDate: '2026-02-10T07:30:00Z' },
      { id: 'doc-002', type: 'Photos', name: '4 Area Captures (Storefront, Cooler, Pipes, Van)', uploadDate: '2026-02-10T07:38:00Z' },
      { id: 'doc-003', type: 'Invoice', name: 'Inventory Loss List', uploadDate: '2026-02-10T10:00:00Z' }
    ],

    timeline: [
      { date: '2026-02-08T03:15:00Z', event: 'Winter storm alert sent 48 hours before incident', actor: 'Weather Monitoring System', note: 'STP Criterion 1 met' },
      { date: '2026-02-10T02:30:00Z', event: 'IoT temperature alert triggered - Critical temp drop', actor: 'FloodStop Pro Sensor' },
      { date: '2026-02-10T03:15:00Z', event: 'Water leak sensor detected at 3:15 AM and sent alert', actor: 'FloodStop Pro Sensor', note: 'STP Criterion 3 met' },
      { date: '2026-02-10T04:00:00Z', event: 'Insured acknowledged alert, arrived on-site', actor: 'Kim Lee' },
      { date: '2026-02-10T05:00:00Z', event: 'Emergency mitigation began within 2 hours', actor: 'RapidDry Emergency Services', note: 'STP Criterion 5 met - Response within 2 hours' },
      { date: '2026-02-10T07:30:00Z', event: 'Claim reported via mobile app with 4 area captures', actor: 'Kim Lee' },
      { date: '2026-02-10T07:31:00Z', event: 'AI analysis initiated - STP evaluation', actor: 'AI Claims Engine' },
      { date: '2026-02-10T07:32:00Z', event: 'Prior claim history retrieved (CLM-2024-012847)', actor: 'AI Claims Engine', note: 'STP Criterion 2 & 4 verified' },
      { date: '2026-02-10T07:33:00Z', event: 'All 5 STP criteria validated - 94% confidence', actor: 'AI Claims Engine' },
      { date: '2026-02-10T08:15:00Z', event: 'Claim auto-approved via STP - Adjuster Jennifer Torres assigned', actor: 'AI Auto-Approval System', note: 'Straight-Through Processing completed' },
      { date: '2026-02-10T08:16:00Z', event: 'Payment authorized - ACH transfer scheduled', actor: 'Payment System' },
      { date: '2026-02-10T08:30:00Z', event: 'Fast-Track approval notification sent to insured', actor: 'Communication System' },
      { date: '2026-02-10T14:00:00Z', event: 'Post-approval audit scheduled', actor: 'Quality Assurance' }
    ],

    priorClaimHistory: {
      hasHistory: true,
      priorClaimNumber: 'CLM-2024-012847',
      priorClaimDate: '2024-01-15',
      priorClaimAmount: 15000,
      priorClaimType: 'Water Damage - Frozen Pipe',
      recommendationsFollowed: true,
      preventionMeasures: [
        'Installed FloodStop Pro water sensor (March 2024)',
        'Insulated exposed basement pipes',
        'Enrolled in Smart Business Monitoring Program',
        'Completed winterization checklist'
      ]
    }
  },

  // Additional P&C Claims for Demo Variety
  {
    id: 'pc-claim-002',
    claimNumber: 'PC-2026-002',
    type: 'auto_collision',
    lineOfBusiness: 'property_casualty',
    subType: 'collision',
    status: 'approved',
    priority: 'medium',
    claimant: {
      firstName: 'David',
      lastName: 'Chen',
      email: 'david.chen@email.com',
      phone: '720-555-0198'
    },
    lossEvent: {
      eventType: 'auto_collision',
      lossDate: '2026-01-10T14:30:00Z',
      reportedDate: '2026-01-10T15:00:00Z',
      causeOfLoss: 'Multi-vehicle collision on I-25',
      location: {
        address: 'I-25 & Arapahoe Road',
        city: 'Centennial',
        state: 'CO',
        zip: '80112'
      }
    },
    propertyDamage: {
      affectedAreas: ['Front bumper', 'Hood', 'Right front fender'],
      damageCategories: [
        { category: 'Body Damage', severity: 'Moderate', estimatedCost: 4500 },
        { category: 'Mechanical', severity: 'Minor', estimatedCost: 1200 }
      ],
      totalEstimatedLoss: 5700
    },
    intelligentFNOL: {
      riskScore: 15,
      fraudIndicators: [],
      autoApproval: true,
      straightThroughProcessing: true,
      aiRecommendedActions: ['Auto-approve claim', 'Schedule repair estimate']
    },
    financial: {
      claimAmount: 5700,
      initialReserve: 6000,
      currentReserve: 5700,
      policyLimit: 100000,
      deductible: 500,
      totalExposure: 5700,
      paidToDate: 5700,
      reserveAdequacy: 'adequate'
    },
    policy: {
      policyNumber: 'AUTO-CO-456123',
      policyType: 'Personal Auto',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'payment_issued',
      assignedTo: 'Sarah Williams',
      sla: { currentStatus: 'completed' }
    },
    aiInsights: {
      claimSummary: 'Straightforward auto collision with police report validation. Low complexity, auto-approved for payment.',
      recommendedActions: ['Payment issued', 'Close claim'],
      similarClaims: 145,
      averageSettlementTime: '3 days',
      settlementPrediction: '$5,700'
    }
  },

  {
    id: 'pc-claim-003',
    claimNumber: 'PC-2026-003',
    type: 'homeowners',
    lineOfBusiness: 'property_casualty',
    subType: 'fire_damage',
    status: 'under_review',
    priority: 'high',
    claimant: {
      firstName: 'Jennifer',
      lastName: 'Martinez',
      email: 'j.martinez@email.com',
      phone: '303-555-0176'
    },
    lossEvent: {
      eventType: 'fire',
      lossDate: '2026-01-12T22:00:00Z',
      reportedDate: '2026-01-12T23:30:00Z',
      causeOfLoss: 'Kitchen fire from unattended cooking',
      location: {
        address: '3421 Maple Drive',
        city: 'Boulder',
        state: 'CO',
        zip: '80301'
      }
    },
    propertyDamage: {
      affectedAreas: ['Kitchen', 'Dining Room', 'Living Room'],
      damageCategories: [
        { category: 'Fire Damage', severity: 'Major', estimatedCost: 45000, description: 'Structural damage to kitchen and adjacent areas' },
        { category: 'Smoke Damage', severity: 'Moderate', estimatedCost: 15000, description: 'Smoke damage throughout first floor' },
        { category: 'Water Damage', severity: 'Minor', estimatedCost: 8000, description: 'Fire suppression water damage' }
      ],
      totalEstimatedLoss: 68000
    },
    intelligentFNOL: {
      riskScore: 42,
      fraudIndicators: ['Late night incident', 'High claim amount'],
      autoApproval: false,
      requiresAdjuster: true,
      aiRecommendedActions: ['Assign senior adjuster', 'Request fire marshal report', 'Document all damages with photos']
    },
    financial: {
      claimAmount: 68000,
      initialReserve: 75000,
      currentReserve: 75000,
      policyLimit: 350000,
      deductible: 2500,
      totalExposure: 68000,
      paidToDate: 0,
      reserveAdequacy: 'adequate'
    },
    policy: {
      policyNumber: 'HO-CO-789012',
      policyType: 'Homeowners',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'investigation',
      assignedTo: 'Michael Torres',
      sla: { currentStatus: 'at_risk' }
    },
    aiInsights: {
      claimSummary: 'Kitchen fire with moderate fraud indicators. Requires thorough investigation and fire marshal report.',
      recommendedActions: ['Assign investigator', 'Review fire report', 'Schedule adjuster visit'],
      similarClaims: 23,
      averageSettlementTime: '18 days',
      settlementPrediction: '$62,000 - $72,000'
    }
  },

  {
    id: 'pc-claim-004',
    claimNumber: 'PC-2026-004',
    type: 'liability',
    lineOfBusiness: 'property_casualty',
    subType: 'general_liability',
    status: 'pending',
    priority: 'medium',
    claimant: {
      firstName: 'Robert',
      lastName: 'Thompson',
      businessName: 'Thompson Construction LLC',
      email: 'robert@thompsonconstruction.com',
      phone: '303-555-0143'
    },
    lossEvent: {
      eventType: 'property_damage',
      lossDate: '2026-01-08T11:00:00Z',
      reportedDate: '2026-01-09T09:00:00Z',
      causeOfLoss: 'Equipment damage to client property',
      location: {
        address: '5678 Construction Site Ave',
        city: 'Aurora',
        state: 'CO',
        zip: '80015'
      }
    },
    propertyDamage: {
      affectedAreas: ['Underground utilities', 'Landscaping'],
      damageCategories: [
        { category: 'Utility Damage', severity: 'Moderate', estimatedCost: 12000, description: 'Damage to underground utility lines' },
        { category: 'Landscape Restoration', severity: 'Minor', estimatedCost: 3500, description: 'Landscape repair and restoration' }
      ],
      totalEstimatedLoss: 15500
    },
    intelligentFNOL: {
      riskScore: 25,
      fraudIndicators: [],
      autoApproval: false,
      requiresAdjuster: true,
      aiRecommendedActions: ['Verify utility company reports', 'Review contractor insurance']
    },
    financial: {
      claimAmount: 15500,
      initialReserve: 18000,
      currentReserve: 18000,
      policyLimit: 1000000,
      deductible: 1000,
      totalExposure: 15500,
      paidToDate: 0,
      reserveAdequacy: 'adequate'
    },
    policy: {
      policyNumber: 'GL-CO-234567',
      policyType: 'General Liability',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'initial_review',
      assignedTo: 'Lisa Anderson',
      sla: { currentStatus: 'on_track' }
    },
    aiInsights: {
      claimSummary: 'General liability claim for construction-related property damage. Standard processing.',
      recommendedActions: ['Review contractor compliance', 'Verify damages with utility company'],
      similarClaims: 67,
      averageSettlementTime: '14 days',
      settlementPrediction: '$15,000 - $17,000'
    }
  },

  {
    id: 'pc-claim-005',
    claimNumber: 'PC-2026-005',
    type: 'auto_comprehensive',
    lineOfBusiness: 'property_casualty',
    subType: 'theft',
    status: 'investigation',
    priority: 'high',
    claimant: {
      firstName: 'Amanda',
      lastName: 'Foster',
      email: 'afoster@email.com',
      phone: '720-555-0182'
    },
    lossEvent: {
      eventType: 'theft',
      lossDate: '2026-01-14T02:00:00Z',
      reportedDate: '2026-01-14T07:30:00Z',
      causeOfLoss: 'Vehicle theft from parking garage',
      location: {
        address: '1500 Parking Garage Lane',
        city: 'Denver',
        state: 'CO',
        zip: '80202'
      }
    },
    propertyDamage: {
      affectedAreas: ['Entire vehicle'],
      damageCategories: [
        { category: 'Total Loss', severity: 'Critical', estimatedCost: 28000, description: '2023 Honda Accord - total loss due to theft' }
      ],
      totalEstimatedLoss: 28000
    },
    intelligentFNOL: {
      riskScore: 65,
      fraudIndicators: ['Late reporting', 'High-value vehicle', 'No witness'],
      autoApproval: false,
      requiresAdjuster: true,
      aiRecommendedActions: ['Initiate fraud investigation', 'Verify police report', 'Check for GPS/tracking data']
    },
    financial: {
      claimAmount: 28000,
      initialReserve: 30000,
      currentReserve: 30000,
      policyLimit: 50000,
      deductible: 1000,
      totalExposure: 28000,
      paidToDate: 0,
      reserveAdequacy: 'adequate'
    },
    policy: {
      policyNumber: 'AUTO-CO-567890',
      policyType: 'Personal Auto',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'fraud_investigation',
      assignedTo: 'Detective Services',
      sla: { currentStatus: 'extended' }
    },
    aiInsights: {
      claimSummary: 'Auto theft with elevated fraud indicators. Extended investigation required before settlement.',
      recommendedActions: ['Complete fraud investigation', 'Verify police report authenticity', 'Check for recovery'],
      similarClaims: 12,
      averageSettlementTime: '25 days',
      settlementPrediction: '$27,000 or Denial'
    }
  },

  // Hail Damage - Auto
  {
    id: 'pc-claim-006',
    claimNumber: 'PC-2026-006',
    type: 'auto_comprehensive',
    lineOfBusiness: 'property_casualty',
    subType: 'hail_damage',
    status: 'new',
    priority: 'low',
    createdAt: '2026-02-08T10:00:00Z',
    routing: { type: 'FASTTRACK', reason: 'Low complexity, clear causation, weather-verified' },
    claimant: {
      firstName: 'Steven',
      lastName: 'Parker',
      email: 'sparker@email.com',
      phone: '303-555-0199'
    },
    lossEvent: {
      eventType: 'hail_storm',
      lossDate: '2026-02-07T16:45:00Z',
      reportedDate: '2026-02-08T10:00:00Z',
      causeOfLoss: 'Hail damage during severe thunderstorm',
      location: {
        address: '2341 Cherry Creek Dr',
        city: 'Denver',
        state: 'CO',
        zip: '80209'
      },
      weatherData: {
        conditions: 'Severe Thunderstorm with Hail',
        hailSize: '1.5 inches',
        source: 'NOAA Weather Service',
        alertLevel: 'moderate'
      }
    },
    propertyDamage: {
      affectedAreas: ['Hood', 'Roof', 'Trunk'],
      damageCategories: [
        { category: 'Hail Dents', severity: 'Minor', estimatedCost: 3200, description: 'Multiple hail dents across vehicle' }
      ],
      totalEstimatedLoss: 3200
    },
    intelligentFNOL: {
      riskScore: 8,
      fraudIndicators: [],
      autoApproval: true,
      straightThroughProcessing: true,
      aiRecommendedActions: ['Auto-approve for paintless dent repair', 'Schedule PDR appointment']
    },
    financial: {
      claimAmount: 3200,
      initialReserve: 3500,
      currentReserve: 3500,
      policyLimit: 50000,
      deductible: 500,
      totalExposure: 3200,
      paidToDate: 0,
      reserveAdequacy: 'adequate'
    },
    policy: {
      policyNumber: 'AUTO-CO-678901',
      policyType: 'Personal Auto',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'new',
      assignedTo: null,
      sla: {
        dueDate: '2026-02-15T10:00:00Z',
        currentStatus: 'on_track'
      }
    },
    aiInsights: {
      claimSummary: 'FastTrack eligible hail damage claim. Weather verified, low fraud risk, quick settlement expected.',
      recommendedActions: ['Auto-approve', 'Schedule PDR service'],
      similarClaims: 342,
      averageSettlementTime: '2 days',
      settlementPrediction: '$3,200'
    }
  },

  // Workers Compensation
  {
    id: 'pc-claim-007',
    claimNumber: 'PC-2026-007',
    type: 'workers_comp',
    lineOfBusiness: 'property_casualty',
    subType: 'injury',
    status: 'under_review',
    priority: 'high',
    createdAt: '2026-02-05T14:30:00Z',
    claimant: {
      firstName: 'Michelle',
      lastName: 'Johnson',
      email: 'mjohnson@mountainbuilders.com',
      phone: '720-555-0145'
    },
    lossEvent: {
      eventType: 'workplace_injury',
      lossDate: '2026-02-05T11:00:00Z',
      reportedDate: '2026-02-05T14:30:00Z',
      causeOfLoss: 'Slip and fall from ladder',
      location: {
        address: '4500 Construction Site Rd',
        city: 'Lakewood',
        state: 'CO',
        zip: '80227'
      }
    },
    propertyDamage: {
      affectedAreas: ['Medical treatment', 'Lost wages'],
      damageCategories: [
        { category: 'Medical Expenses', severity: 'Moderate', estimatedCost: 8500, description: 'ER visit, X-rays, follow-up care' },
        { category: 'Lost Wages', severity: 'Moderate', estimatedCost: 4200, description: 'Estimated 2 weeks recovery time' }
      ],
      totalEstimatedLoss: 12700
    },
    intelligentFNOL: {
      riskScore: 22,
      fraudIndicators: [],
      autoApproval: false,
      requiresAdjuster: true,
      aiRecommendedActions: ['Verify incident report', 'Schedule IME if necessary', 'Coordinate with medical provider']
    },
    financial: {
      claimAmount: 12700,
      initialReserve: 15000,
      currentReserve: 15000,
      policyLimit: 500000,
      deductible: 0,
      totalExposure: 12700,
      paidToDate: 0,
      reserveAdequacy: 'adequate'
    },
    policy: {
      policyNumber: 'WC-CO-345678',
      policyType: 'Workers Compensation',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'medical_review',
      assignedTo: 'Patricia Davis',
      sla: {
        dueDate: '2026-02-19T14:30:00Z',
        currentStatus: 'on_track'
      }
    },
    aiInsights: {
      claimSummary: 'Workers compensation claim for ladder fall. Requires medical review and wage verification.',
      recommendedActions: ['Review medical records', 'Verify employment', 'Coordinate care'],
      similarClaims: 89,
      averageSettlementTime: '21 days',
      settlementPrediction: '$12,000 - $14,000'
    }
  },

  // Commercial Property - Closed/Paid
  {
    id: 'pc-claim-008',
    claimNumber: 'PC-2026-008',
    type: 'commercial_property',
    lineOfBusiness: 'property_casualty',
    subType: 'wind_damage',
    status: 'closed',
    priority: 'medium',
    createdAt: '2026-01-20T09:00:00Z',
    closedAt: '2026-02-03T16:00:00Z',
    routing: { type: 'FASTTRACK', reason: 'Weather-verified, straightforward causation' },
    claimant: {
      firstName: 'Thomas',
      lastName: 'Wright',
      businessName: 'Mile High Cafe',
      email: 'twright@milehighcafe.com',
      phone: '303-555-0167'
    },
    lossEvent: {
      eventType: 'windstorm',
      lossDate: '2026-01-19T21:00:00Z',
      reportedDate: '2026-01-20T09:00:00Z',
      causeOfLoss: 'Wind damage to roof and signage',
      location: {
        address: '789 Main Street',
        city: 'Longmont',
        state: 'CO',
        zip: '80501'
      },
      weatherData: {
        conditions: 'High Wind Warning',
        windSpeed: '65 mph gusts',
        source: 'NOAA Weather Service',
        alertLevel: 'severe'
      }
    },
    propertyDamage: {
      affectedAreas: ['Roof', 'Exterior signage', 'Awning'],
      damageCategories: [
        { category: 'Roof Damage', severity: 'Moderate', estimatedCost: 12000, description: 'Shingle and flashing damage' },
        { category: 'Sign Replacement', severity: 'Major', estimatedCost: 4500, description: 'Complete sign replacement required' }
      ],
      totalEstimatedLoss: 16500
    },
    intelligentFNOL: {
      riskScore: 12,
      fraudIndicators: [],
      autoApproval: false,
      straightThroughProcessing: false,
      aiRecommendedActions: ['Authorize emergency roof repairs', 'Schedule contractor inspection']
    },
    financial: {
      claimAmount: 16500,
      initialReserve: 18000,
      currentReserve: 0,
      policyLimit: 500000,
      deductible: 2500,
      totalExposure: 16500,
      paidToDate: 16500,
      reserveAdequacy: 'closed',
      payments: [
        {
          id: 'PAY-008-001',
          amount: 16500,
          payee: 'Thomas Wright',
          status: 'Paid',
          date: '2026-02-03',
          type: 'Claim Settlement',
          method: 'ACH Transfer',
          checkNumber: 'ACH-234567'
        }
      ]
    },
    policy: {
      policyNumber: 'BOP-CO-456789',
      policyType: 'Business Owners Policy',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'closed',
      assignedTo: 'James Mitchell',
      sla: { currentStatus: 'completed' }
    },
    aiInsights: {
      claimSummary: 'Wind damage claim successfully closed. Weather-verified, quick settlement.',
      recommendedActions: ['Claim closed'],
      similarClaims: 178,
      averageSettlementTime: '14 days',
      settlementPrediction: '$16,500'
    }
  },

  // Homeowners - Water Damage
  {
    id: 'pc-claim-009',
    claimNumber: 'PC-2026-009',
    type: 'homeowners',
    lineOfBusiness: 'property_casualty',
    subType: 'water_damage',
    status: 'pending_requirements',
    priority: 'medium',
    createdAt: '2026-02-06T13:00:00Z',
    claimant: {
      firstName: 'Patricia',
      lastName: 'Anderson',
      email: 'panderson@email.com',
      phone: '720-555-0123'
    },
    lossEvent: {
      eventType: 'plumbing_failure',
      lossDate: '2026-02-06T06:00:00Z',
      reportedDate: '2026-02-06T13:00:00Z',
      causeOfLoss: 'Hot water heater failure',
      location: {
        address: '5621 Willow Lane',
        city: 'Fort Collins',
        state: 'CO',
        zip: '80525'
      }
    },
    propertyDamage: {
      affectedAreas: ['Basement', 'Laundry room', 'Storage area'],
      damageCategories: [
        { category: 'Water Damage', severity: 'Moderate', estimatedCost: 8500, description: 'Flooring and drywall damage' },
        { category: 'Equipment Replacement', severity: 'Major', estimatedCost: 2200, description: 'Hot water heater replacement' },
        { category: 'Personal Property', severity: 'Minor', estimatedCost: 1800, description: 'Damaged stored items' }
      ],
      totalEstimatedLoss: 12500
    },
    intelligentFNOL: {
      riskScore: 18,
      fraudIndicators: [],
      autoApproval: false,
      requiresAdjuster: true,
      aiRecommendedActions: ['Request plumber invoice', 'Document damaged personal property', 'Schedule adjuster visit']
    },
    financial: {
      claimAmount: 12500,
      initialReserve: 14000,
      currentReserve: 14000,
      policyLimit: 250000,
      deductible: 1000,
      totalExposure: 12500,
      paidToDate: 0,
      reserveAdequacy: 'adequate'
    },
    policy: {
      policyNumber: 'HO-CO-890123',
      policyType: 'Homeowners',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'awaiting_documents',
      assignedTo: 'Sarah Williams',
      sla: {
        dueDate: '2026-02-20T13:00:00Z',
        currentStatus: 'on_track'
      }
    },
    requirements: [
      { id: 'req-001', type: 'Plumber Invoice', status: 'PENDING', dueDate: '2026-02-13T00:00:00Z' },
      { id: 'req-002', type: 'Photos of Damage', status: 'SATISFIED', receivedDate: '2026-02-06T15:00:00Z' },
      { id: 'req-003', type: 'Personal Property List', status: 'PENDING', dueDate: '2026-02-13T00:00:00Z' }
    ],
    aiInsights: {
      claimSummary: 'Homeowners water damage from hot water heater failure. Awaiting documentation.',
      recommendedActions: ['Follow up on missing invoices', 'Review personal property list when received'],
      similarClaims: 234,
      averageSettlementTime: '11 days',
      settlementPrediction: '$11,500 - $13,000'
    }
  },

  // Auto Collision - At Risk SLA
  {
    id: 'pc-claim-010',
    claimNumber: 'PC-2026-010',
    type: 'auto_collision',
    lineOfBusiness: 'property_casualty',
    subType: 'rear_end',
    status: 'under_review',
    priority: 'high',
    createdAt: '2026-01-28T11:00:00Z',
    claimant: {
      firstName: 'Kevin',
      lastName: 'Martinez',
      email: 'kmartinez@email.com',
      phone: '303-555-0188'
    },
    lossEvent: {
      eventType: 'auto_collision',
      lossDate: '2026-01-27T17:30:00Z',
      reportedDate: '2026-01-28T11:00:00Z',
      causeOfLoss: 'Rear-end collision at stoplight',
      location: {
        address: 'Broadway & Evans Ave',
        city: 'Denver',
        state: 'CO',
        zip: '80210'
      }
    },
    propertyDamage: {
      affectedAreas: ['Rear bumper', 'Trunk', 'Tail lights'],
      damageCategories: [
        { category: 'Body Damage', severity: 'Moderate', estimatedCost: 5200, description: 'Rear-end collision damage' },
        { category: 'Frame Check', severity: 'Moderate', estimatedCost: 800, description: 'Frame alignment inspection' }
      ],
      totalEstimatedLoss: 6000
    },
    intelligentFNOL: {
      riskScore: 32,
      fraudIndicators: ['Conflicting statements'],
      autoApproval: false,
      requiresAdjuster: true,
      aiRecommendedActions: ['Review police report', 'Interview witnesses', 'Inspect vehicle']
    },
    financial: {
      claimAmount: 6000,
      initialReserve: 7000,
      currentReserve: 7000,
      policyLimit: 100000,
      deductible: 500,
      totalExposure: 6000,
      paidToDate: 0,
      reserveAdequacy: 'adequate'
    },
    policy: {
      policyNumber: 'AUTO-CO-789012',
      policyType: 'Personal Auto',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'liability_review',
      assignedTo: 'Michael Torres',
      sla: {
        dueDate: '2026-02-11T11:00:00Z',
        currentStatus: 'at_risk'
      }
    },
    aiInsights: {
      claimSummary: 'Auto collision with liability questions. Delayed due to conflicting statements.',
      recommendedActions: ['Expedite investigation', 'Request additional witness statements'],
      similarClaims: 456,
      averageSettlementTime: '16 days',
      settlementPrediction: '$5,500 - $6,500'
    }
  },

  // Commercial Property - Denied
  {
    id: 'pc-claim-011',
    claimNumber: 'PC-2026-011',
    type: 'commercial_property',
    lineOfBusiness: 'property_casualty',
    subType: 'theft',
    status: 'denied',
    priority: 'low',
    createdAt: '2026-01-18T14:00:00Z',
    closedAt: '2026-02-01T10:00:00Z',
    claimant: {
      firstName: 'Brandon',
      lastName: 'Lee',
      businessName: 'Tech Solutions Inc',
      email: 'blee@techsolutions.com',
      phone: '720-555-0156'
    },
    lossEvent: {
      eventType: 'theft',
      lossDate: '2026-01-17T00:00:00Z',
      reportedDate: '2026-01-18T14:00:00Z',
      causeOfLoss: 'Equipment theft from office',
      location: {
        address: '3200 Tech Park Blvd',
        city: 'Colorado Springs',
        state: 'CO',
        zip: '80919'
      }
    },
    propertyDamage: {
      affectedAreas: ['Office equipment'],
      damageCategories: [
        { category: 'Electronics Theft', severity: 'Major', estimatedCost: 15000, description: 'Laptops, monitors, and equipment' }
      ],
      totalEstimatedLoss: 15000
    },
    intelligentFNOL: {
      riskScore: 88,
      fraudIndicators: ['No forced entry', 'No security footage', 'Weekend incident', 'Delayed reporting'],
      autoApproval: false,
      requiresAdjuster: true,
      aiRecommendedActions: ['Fraud investigation required', 'Review security measures', 'Police report verification']
    },
    financial: {
      claimAmount: 15000,
      initialReserve: 17000,
      currentReserve: 0,
      policyLimit: 500000,
      deductible: 2500,
      totalExposure: 0,
      paidToDate: 0,
      reserveAdequacy: 'closed'
    },
    policy: {
      policyNumber: 'BOP-CO-567890',
      policyType: 'Business Owners Policy',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'closed',
      assignedTo: 'Detective Services',
      sla: { currentStatus: 'completed' }
    },
    aiInsights: {
      claimSummary: 'Claim denied due to fraud indicators and failure to meet security requirements per policy.',
      recommendedActions: ['Claim denied and closed'],
      similarClaims: 8,
      averageSettlementTime: '14 days',
      settlementPrediction: 'Denied'
    },
    denialReason: 'Fraud investigation revealed inconsistencies. Failure to maintain required security measures per policy Section 4.2.3.'
  },

  // Liability - Slip and Fall
  {
    id: 'pc-claim-012',
    claimNumber: 'PC-2026-012',
    type: 'liability',
    lineOfBusiness: 'property_casualty',
    subType: 'premises_liability',
    status: 'under_review',
    priority: 'high',
    createdAt: '2026-02-04T15:30:00Z',
    claimant: {
      firstName: 'Catherine',
      lastName: 'Miller',
      businessName: 'Riverside Retail Plaza',
      email: 'cmiller@riversideplaza.com',
      phone: '303-555-0134'
    },
    lossEvent: {
      eventType: 'slip_and_fall',
      lossDate: '2026-02-03T12:00:00Z',
      reportedDate: '2026-02-04T15:30:00Z',
      causeOfLoss: 'Customer slip and fall in retail store',
      location: {
        address: '8900 Riverside Dr',
        city: 'Denver',
        state: 'CO',
        zip: '80219'
      }
    },
    propertyDamage: {
      affectedAreas: ['Medical treatment', 'Liability exposure'],
      damageCategories: [
        { category: 'Medical Expenses', severity: 'Moderate', estimatedCost: 12000, description: 'ER treatment for fractured wrist' },
        { category: 'Pain & Suffering', severity: 'Unknown', estimatedCost: 25000, description: 'Potential liability exposure' }
      ],
      totalEstimatedLoss: 37000
    },
    intelligentFNOL: {
      riskScore: 45,
      fraudIndicators: ['High medical claims immediately', 'Attorney involved'],
      autoApproval: false,
      requiresAdjuster: true,
      aiRecommendedActions: ['Assign defense attorney', 'Document scene conditions', 'Review security footage']
    },
    financial: {
      claimAmount: 37000,
      initialReserve: 45000,
      currentReserve: 45000,
      policyLimit: 2000000,
      deductible: 5000,
      totalExposure: 37000,
      paidToDate: 0,
      reserveAdequacy: 'monitoring'
    },
    policy: {
      policyNumber: 'GL-CO-678901',
      policyType: 'General Liability',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'legal_review',
      assignedTo: 'Legal Department',
      sla: {
        dueDate: '2026-02-18T15:30:00Z',
        currentStatus: 'on_track'
      }
    },
    aiInsights: {
      claimSummary: 'Premises liability claim with attorney involvement. Requires legal review and investigation.',
      recommendedActions: ['Coordinate with legal counsel', 'Preserve evidence', 'Review maintenance records'],
      similarClaims: 34,
      averageSettlementTime: '45 days',
      settlementPrediction: '$30,000 - $50,000'
    }
  },

  // Auto Comprehensive - Vandalism (Closed/FastTrack)
  {
    id: 'pc-claim-013',
    claimNumber: 'PC-2026-013',
    type: 'auto_comprehensive',
    lineOfBusiness: 'property_casualty',
    subType: 'vandalism',
    status: 'closed',
    priority: 'low',
    createdAt: '2026-01-25T08:00:00Z',
    closedAt: '2026-01-30T14:00:00Z',
    routing: { type: 'FASTTRACK', reason: 'Police verified, low cost, clear documentation' },
    claimant: {
      firstName: 'Eric',
      lastName: 'Thompson',
      email: 'ethompson@email.com',
      phone: '720-555-0191'
    },
    lossEvent: {
      eventType: 'vandalism',
      lossDate: '2026-01-24T23:00:00Z',
      reportedDate: '2026-01-25T08:00:00Z',
      causeOfLoss: 'Keyed vehicle in parking lot',
      location: {
        address: '4500 Apartment Complex Dr',
        city: 'Arvada',
        state: 'CO',
        zip: '80002'
      }
    },
    propertyDamage: {
      affectedAreas: ['Driver side doors', 'Rear quarter panel'],
      damageCategories: [
        { category: 'Paint Damage', severity: 'Minor', estimatedCost: 2100, description: 'Deep scratches requiring repaint' }
      ],
      totalEstimatedLoss: 2100
    },
    intelligentFNOL: {
      riskScore: 10,
      fraudIndicators: [],
      autoApproval: true,
      straightThroughProcessing: true,
      aiRecommendedActions: ['Auto-approve for repair', 'Schedule paint shop appointment']
    },
    financial: {
      claimAmount: 2100,
      initialReserve: 2500,
      currentReserve: 0,
      policyLimit: 50000,
      deductible: 500,
      totalExposure: 2100,
      paidToDate: 2100,
      reserveAdequacy: 'closed',
      payments: [
        {
          id: 'PAY-013-001',
          amount: 2100,
          payee: 'Eric Thompson',
          status: 'Paid',
          date: '2026-01-30',
          type: 'Claim Settlement',
          method: 'Check',
          checkNumber: 'CHK-123456'
        }
      ]
    },
    policy: {
      policyNumber: 'AUTO-CO-890123',
      policyType: 'Personal Auto',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'closed',
      assignedTo: 'Sarah Williams',
      sla: { currentStatus: 'completed' }
    },
    aiInsights: {
      claimSummary: 'FastTrack vandalism claim. Police report verified, quick settlement.',
      recommendedActions: ['Claim closed'],
      similarClaims: 567,
      averageSettlementTime: '5 days',
      settlementPrediction: '$2,100'
    }
  },

  // Homeowners - Burglary
  {
    id: 'pc-claim-014',
    claimNumber: 'PC-2026-014',
    type: 'homeowners',
    lineOfBusiness: 'property_casualty',
    subType: 'theft',
    status: 'under_review',
    priority: 'high',
    createdAt: '2026-02-07T10:30:00Z',
    claimant: {
      firstName: 'Rachel',
      lastName: 'Garcia',
      email: 'rgarcia@email.com',
      phone: '303-555-0177'
    },
    lossEvent: {
      eventType: 'burglary',
      lossDate: '2026-02-06T14:00:00Z',
      reportedDate: '2026-02-07T10:30:00Z',
      causeOfLoss: 'Home burglary during daytime',
      location: {
        address: '7823 Highland Ave',
        city: 'Thornton',
        state: 'CO',
        zip: '80229'
      }
    },
    propertyDamage: {
      affectedAreas: ['Master bedroom', 'Living room', 'Home office'],
      damageCategories: [
        { category: 'Electronics Theft', severity: 'Major', estimatedCost: 8500, description: 'TVs, laptop, gaming systems' },
        { category: 'Jewelry Theft', severity: 'Critical', estimatedCost: 12000, description: 'Wedding rings, watches, heirlooms' },
        { category: 'Forced Entry Damage', severity: 'Moderate', estimatedCost: 1800, description: 'Broken door lock and frame' }
      ],
      totalEstimatedLoss: 22300
    },
    intelligentFNOL: {
      riskScore: 38,
      fraudIndicators: ['High-value jewelry claim', 'No receipts provided yet'],
      autoApproval: false,
      requiresAdjuster: true,
      aiRecommendedActions: ['Verify police report', 'Request receipts for high-value items', 'Schedule adjuster visit']
    },
    financial: {
      claimAmount: 22300,
      initialReserve: 25000,
      currentReserve: 25000,
      policyLimit: 250000,
      deductible: 1000,
      totalExposure: 22300,
      paidToDate: 0,
      reserveAdequacy: 'adequate'
    },
    policy: {
      policyNumber: 'HO-CO-901234',
      policyType: 'Homeowners',
      carrier: 'Assure Insurance Group'
    },
    workflow: {
      currentStage: 'documentation_review',
      assignedTo: 'Michael Torres',
      sla: {
        dueDate: '2026-02-21T10:30:00Z',
        currentStatus: 'on_track'
      }
    },
    requirements: [
      { id: 'req-001', type: 'Police Report', status: 'SATISFIED', receivedDate: '2026-02-07T11:00:00Z' },
      { id: 'req-002', type: 'Electronics Receipts', status: 'PENDING', dueDate: '2026-02-14T00:00:00Z' },
      { id: 'req-003', type: 'Jewelry Appraisals', status: 'PENDING', dueDate: '2026-02-14T00:00:00Z' },
      { id: 'req-004', type: 'Photos of Damage', status: 'SATISFIED', receivedDate: '2026-02-07T12:00:00Z' }
    ],
    aiInsights: {
      claimSummary: 'Burglary claim with high-value items. Awaiting documentation for jewelry and electronics.',
      recommendedActions: ['Follow up on receipts', 'Verify jewelry appraisals', 'Coordinate repair for forced entry'],
      similarClaims: 78,
      averageSettlementTime: '19 days',
      settlementPrediction: '$18,000 - $23,000'
    }
  },

  // Commercial Auto - Fleet Vehicle
  {
    id: 'pc-claim-015',
    claimNumber: 'PC-2026-015',
    type: 'auto_collision',
    lineOfBusiness: 'property_casualty',
    subType: 'commercial_auto',
    status: 'new',
    priority: 'medium',
    createdAt: '2026-02-09T07:00:00Z',
    routing: { type: 'FASTTRACK', reason: 'Commercial fleet account, clear liability' },
    claimant: {
      firstName: 'Daniel',
      lastName: 'Rodriguez',
      businessName: 'Rocky Mountain Delivery Services',
      email: 'drodriguez@rmdelivery.com',
      phone: '303-555-0159'
    },
    lossEvent: {
      eventType: 'auto_collision',
      lossDate: '2026-02-08T16:45:00Z',
      reportedDate: '2026-02-09T07:00:00Z',
      causeOfLoss: 'Delivery van backed into loading dock',
      location: {
        address: '3300 Warehouse Blvd',
        city: 'Commerce City',
        state: 'CO',
        zip: '80022'
      }
    },
    propertyDamage: {
      affectedAreas: ['Rear doors', 'Rear bumper'],
      damageCategories: [
        { category: 'Body Damage', severity: 'Moderate', estimatedCost: 3800, description: 'Rear-end collision with loading dock' }
      ],
      totalEstimatedLoss: 3800
    },
    intelligentFNOL: {
      riskScore: 5,
      fraudIndicators: [],
      autoApproval: true,
      straightThroughProcessing: true,
      aiRecommendedActions: ['Auto-approve commercial fleet claim', 'Schedule shop appointment']
    },
    financial: {
      claimAmount: 3800,
      initialReserve: 4000,
      currentReserve: 4000,
      policyLimit: 500000,
      deductible: 1000,
      totalExposure: 3800,
      paidToDate: 0,
      reserveAdequacy: 'adequate'
    },
    policy: {
      policyNumber: 'CA-CO-123456',
      policyType: 'Commercial Auto',
      carrier: 'Assure Insurance Group',
      fleetAccount: true
    },
    workflow: {
      currentStage: 'new',
      assignedTo: null,
      sla: {
        dueDate: '2026-02-16T07:00:00Z',
        currentStatus: 'on_track'
      }
    },
    aiInsights: {
      claimSummary: 'Commercial fleet FastTrack claim. Simple backing incident, quick settlement expected.',
      recommendedActions: ['Auto-approve', 'Coordinate with fleet manager'],
      similarClaims: 892,
      averageSettlementTime: '4 days',
      settlementPrediction: '$3,800'
    }
  }
];

export default pcDemoData;
