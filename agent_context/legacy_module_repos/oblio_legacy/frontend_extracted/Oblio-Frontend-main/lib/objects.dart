import 'package:flutter/material.dart';
import 'oblio_icons.dart';

class Objects {
  Objects._();
  /* Note: still pondering whether I should include all of these values
  under a single map, but for readability and development, for now it
  works well */

  /* Note: The follow definitions prevent misspellings and ensure
  consistency; they are not required, but it is good practice. */

  /// Oblio's Contacts object
  static const Contacts = 'contacts';

  /// Oblio's Users object
  static const Users = 'users';

  /// Oblio's Activities object
  static const Activities = 'activities';

  /// Oblio's Accounts object
  static const Accounts = 'accounts';

  /// Oblio's Campaigns object
  static const Campaigns = 'campaigns';

  /// Oblio's Pipelines object
  static const Pipelines = 'pipelines';

  /// Oblio's Contents object
  static const Contents = 'contents';

  /// Oblio's Workflows object
  static const Workflows = 'workflows';

  /// Oblio's Opportunities object
  static const Opps = 'opportunities';

  /// Oblio's Products object
  static const Products = 'products';

  /* Note: This file does not contain all of the fieldMapping data, but
  it gives a good idea of how it would look like, as a simple map */

  /* This is not finalised; the title/subtitle mapping might be split into
  3 sections, depending on what's easier to control when querying data.*/

  /// fieldMappings are used to construct oblioTiles, each key refers
  /// to a particular object, and its values to which object property
  /// should be included in each section of the card

  static const Map detailScreen = {
    Objects.Contacts: [
      {
        'title': 'Work Contact Details',
        'items': [
          {'field': 'phone'},
          {'field': 'email'},
          {
            'field': 'skype',
            'data': {'skype': 'csinclair88'}
          },
        ]
      },
      {
        'title': 'Product Persona Attribution',
        'items': [
          {'field': 'primaryPersona'},
          {'field': 'primaryProduct'},
          {
            'field': 'useCases',
            'data': {
              'useCases': ['useCase', 'useCase1', 'useCase2']
            }
          },
          {
            'field': 'filename',
            'data': {'filename': 'propertyName'}
          },
          {'field': 'jobTitle'},
          {'field': 'department'},
          {'field': 'seniority'},
          {
            'field': 'industry',
            'data': {'industry': 'Information Technology'}
          },
          {
            'field': 'sector',
            'data': {'sector': 'Technology'}
          },
          {
            'field': 'companySize',
            'data': {'companySize': '5000+'}
          },
          {
            'field': 'techProfile',
            'data': {'techProfile': 'Salesforce'}
          }
        ]
      },
      {
        'title': 'Work History',
        'field': 'workHistory',
        'data': [
          {
            'accountName': 'IBM Corporation',
            'category': 'Operations',
            'jobTitle': 'Head of Operations',
            'startDate': '05/05/20',
            'endDate': '25/05/20'
          },
          {
            'accountName': 'IBM Corporation',
            'category': 'Operations',
            'jobTitle': 'Head of Operations',
            'startDate': '05/05/20',
            'endDate': '25/05/20'
          },
          {
            'accountName': 'IBM Corporation',
            'category': 'Operations',
            'jobTitle': 'Head of Operations',
            'startDate': '05/05/20',
            'endDate': '25/05/20'
          }
        ]
      },
      {
        'title': 'Contact Links',
        'items': [
          {'field': 'linkedinUrl'},
          {'field': 'facebookURL'},
          {'field': 'twitterURL'}
        ]
      },
      {
        'title': 'Demographics',
        'items': [
          {
            'field': 'gender',
            'data': {'gender': 'Male'}
          },
          {
            'field': 'ageRange',
            'data': {'ageRange': '18 to 35'}
          },
          {
            'field': 'city',
            'data': {'city': 'Unknown'}
          },
          {
            'field': 'state',
            'data': {'state': 'California'}
          },
          {
            'field': 'country',
            'data': {'country': 'United States of America'}
          },
        ]
      },
      {
        'title': 'Aquisition Attribution',
        'objects': [
          {
            'object': 'activities',
            'title': 'ACTIVITY',
            'data': {
              'id': 'fK4ddutEpD2qQqACTIW1',
              'type': 'activity',
              'source': 'email',
              'content': 'message',
              'name': 'Demo Form - 01 - Ver.A',
              'department': 'Sales',
              'startDate': '10/01/22',
              'endDate': '25/05/22'
            },
          },
          // {'object': 'creatives', 'title': 'CREATIVE',
          //   'data': {}},
          // {'object': 'campaigns', 'title': 'CAMPAIGN', 'data': {}}
        ]
      },
      {
        'title': 'User Attribution',
        'objects': [
          {
            'object': 'activities',
            'title': 'OWNED BY',
            'data': {
              'id': 'fK4ddutEpD2qQqACTIW1',
              'type': 'activity',
              'source': 'email',
              'content': 'message',
              'name': 'Demo Form - 01 - Ver.A',
              'department': 'Sales',
              'startDate': '10/01/22',
              'endDate': '25/05/22'
            },
          },
          // {'object': 'creatives', 'title': 'LAST UPDATED BY',
          //   'data': {}},
          // {'object': 'campaigns', 'title': 'CREATED BY', 'data': {}}
        ]
      }
    ]
  };

  static const Map<String, Map<String, dynamic>> fieldMappings = {
    Objects.Contacts: {
      'title': ['primaryPersona', 'account', 'oppType'],
      'subtitle': 'fullName',
      'body': ['jobTitle', 'department', 'seniority'],
      'image': 'profilePicture',
      'health': 'health',
      'contact': {'phone': 'icon', 'email': 'icon'},
      'social': {
        'facebookURL': 'facebook',
        'linkedinUrl': 'linkedin',
        'twitterURL': 'twitter',
        'accountWebsite': 'website'
      },
      // referenced in tile
      'details': {
        // field in map
        'phone': {
          // image on the left
          'image': {
            // Is it an icon or an image?
            'type': 'icon',
            'data': Icons.phone,
          },
          'title': {
            // custom if it's not a field
            'type': 'custom',
            'data': ['Work Phone']
          },
          'subtitle': 'phone'
        },
        'email': {
          'image': {
            'type': 'icon',
            'data': Icons.phone,
          },
          'title': {
            'type': 'custom',
            'data': ['Work Email']
          },
          'subtitle': 'phone'
        },
        'skype': {
          'image': {
            'type': 'icon',
            'data': Icons.phone,
          },
          'title': {
            'type': 'custom',
            'data': ['Skype']
          },
          'subtitle': 'phone'
        }
      }
    },
    Objects.Users: {
      'title': ['department', 'experience', 'stage'],
      'subtitle': 'fullName',
      'image': 'profilePicture',
      'performance': 'userPerformance',
      'activities': 'userActivities'
    },
    Objects.Opps: {
      'title': ['oppStatus', 'oppType', 'account'],
      'completion': 'completion',
      'subtitle': 'oppName',
      'body': ['amount', 'startDate', 'endDate'],
      'health': 'oppHealth'
    },
    Objects.Activities: {
      'title': ['type', 'source', 'content'],
      'subtitle': 'name',
      'body': ['department', 'startDate', 'endDate'],
      'icon': 'source'
    },
    Objects.Accounts: {
      'title': ['accountType', 'status', 'stage'],
      'subtitle': 'companyName',
      'body': ['companyIndustry', 'startDate', 'endDate'],
      //'image': 'logo'
    },

    //TODO: change this!
    Objects.Products: {
      'title': ['status', 'type', 'price', 'duration', 'stages'],
      'subtitle': 'name',
      'body': ['department', 'position', 'strategy', 'features']
    }
  };

  static const Map<String, Map> iconMapping = {
    'linkedin': {
      'icon': Oblio.linkedin,
      'background': Color.fromRGBO(32, 134, 189, 1)
    },
    'facebook': {
      'icon': Oblio.facebook,
      'background': Color.fromRGBO(24, 119, 242, 1)
    },
    'twitter': {
      'icon': Oblio.twitter,
      'background': Color.fromRGBO(45, 170, 225, 1)
    },
    'website': {
      'icon': Oblio.website,
      'background': Color.fromRGBO(52, 202, 135, 1)
    },
    'email': {
      'icon': Icons.email,
      'background': Color.fromRGBO(156, 95, 244, 1)
    },
    'phone': {
      'icon': Icons.phone,
      'background': Color.fromRGBO(253, 182, 83, 1)
    },
    'call': {
      'icon': Icons.phone,
      'background': Color.fromRGBO(253, 182, 83, 1)
    },
    'social': {
      'icon': Icons.share,
      'background': Color.fromRGBO(244, 121, 175, 1)
    },
    'event': {
      'icon': Icons.local_activity,
      'background': Color.fromRGBO(248, 189, 8, 1)
    },
    'search': {
      'icon': Icons.search_outlined,
      'background': Color.fromRGBO(249, 54, 130, 1)
    },
    'display': {
      'icon': Oblio.display,
      'background': Color.fromRGBO(76, 109, 218, 1)
    },
    'admin': {
      'icon': Icons.assignment_late,
      'background': Color.fromRGBO(255, 57, 57, 1)
    }
  };

  /// These are the valid routes a user can visit in Oblio. The true/false
  /// booleans represent whether a route is in construction.

  static const routes = {
    'setup': true,
    'dashboard': true,
    Objects.Contacts: true,
    Objects.Accounts: true,
    Objects.Campaigns: true,
    Objects.Users: false,
    Objects.Activities: false,
    Objects.Opps: false,
    Objects.Products: false,
    Objects.Pipelines: false,
    Objects.Contents: false,
    Objects.Workflows: false,
    'organisation': false,
    'data': false
  };

  static const Map<String, Color> colors = {
    'calendar': Color.fromRGBO(253, 195, 119, 1),
    Objects.Campaigns: Color.fromRGBO(253, 195, 119, 1),
    Objects.Contacts: Color.fromRGBO(253, 195, 119, 1),
    Objects.Products: Color.fromRGBO(253, 195, 119, 1),
    Objects.Activities: Color.fromRGBO(250, 69, 131, 1),
    'email': Color.fromRGBO(253, 195, 119, 1),
    'phone': Color.fromRGBO(253, 195, 119, 1)
  };

  static const Map<String, Map> crudItems = {
    'calendar': {
      'icon': Icons.date_range,
      'color': Color.fromRGBO(67, 91, 217, 1),
      'header': 'ADD EVENT'
    },
    'activities': {
      'icon': Icons.add_task,
      'color': Color.fromRGBO(250, 69, 131, 1),
      'header': 'ADD ACTIVITY'
    },
    'contents': {
      'icon': Icons.perm_media,
      'color': Color.fromRGBO(100, 124, 229, 1),
      'header': 'ADD CONTENT'
    },
    'contacts': {
      'icon': Icons.person_add,
      'color': Color.fromRGBO(253, 193, 115, 1),
      'header': 'ADD CONTACT'
    },
    'products': {
      'icon': Icons.add_shopping_cart,
      'color': Color.fromRGBO(14, 187, 106, 1),
      'header': 'ADD PRODUCT'
    },
    'email': {
      'icon': Icons.email,
      'color': Color.fromRGBO(113, 27, 239, 1),
      'header': 'ADD EMAIL'
    },
    'phone': {
      'icon': Icons.phone,
      'color': Color.fromRGBO(253, 175, 76, 1),
      'header': 'ADD NUMBER'
    }
  };

  /// The following columns variable contains a mapping for object columns.
  /// Each object property contains a 'name' and 'size' value, which denotes
  /// the default label at the top, and width of each column

  static const Map<String, Map<String, Map<String, dynamic>>> columns = {
    Objects.Campaigns: {
      'campaignName': {'name': 'Name', 'size': 0},
      'campaignSource': {'name': 'Source', 'size': 0},
      'sourceType': {'name': 'Type', 'size': 0},
      'campaignMedium': {'name': 'Medium', 'size': 0},
      'audience': {'name': 'Audience', 'size': 0},
      'adGroup': {'name': 'Ad Group', 'size': 0},
      'product': {'name': 'Product', 'size': 0}
    },
    Objects.Contacts: {
      'profilePicture': {'name': '', 'size': 60},
      'fullName': {'name': 'Full Name', 'size': 0},
      'jobTitle': {'name': 'Job Title', 'size': 0},
      'department': {'name': 'Department', 'size': 0},
      'account': {'name': 'Account', 'size': 0},
      'primaryProduct': {'name': 'Primary Product', 'size': 0},
      'primaryPersona': {'name': 'Primary Persona', 'size': 0}
    },
    Objects.Accounts: {
      'companyName': {'name': 'Account Name', 'size': 0},
      'companyIndustry': {'name': 'Industry', 'size': 0},
      'companySector': {'name': 'Sector', 'size': 0},
      'companyPhone': {'name': 'Phone', 'size': 0},
      'companyWebsite': {'name': 'Website', 'size': 0},
      'companyAddress': {'name': 'Address', 'size': 0},
      'fundRaising': {'name': 'Fund Raising', 'size': 0}
    }
  };

  /// Currently, the left bar is using instances of the 'NavItem' class, but
  /// I intend to create a single map which feeds into the bar. This will
  /// most likely be changed

  static const Map<String, dynamic> navItems = {
    '': [
      {'route': 'dashboard', 'icon': Icons.dashboard, 'name': 'Dashboard'},
    ],
    'RECORDS': [
      {'route': Objects.Contacts, 'icon': Icons.contacts, 'name': 'Contacts'},
      {'route': Objects.Accounts, 'icon': Icons.business, 'name': 'Accounts'},
      {
        'route': Objects.Activities,
        'icon': Icons.fact_check,
        'name': 'Activities'
      },
      {
        'route': Objects.Opps,
        'icon': Icons.monetization_on_rounded,
        'name': 'Opportunities'
      },
      {
        'route': Objects.Products,
        'icon': Icons.inventory_2_rounded,
        'name': 'Products'
      },
      {
        'route': Objects.Users,
        'icon': Icons.supervised_user_circle_rounded,
        'name': 'Users'
      },
    ],
    'SEGMENTS': [
      {
        'route': Objects.Campaigns,
        'icon': Icons.campaign_rounded,
        'name': 'Campaigns'
      },
      {
        'route': Objects.Pipelines,
        'icon': Oblio.pipelines,
        'name': 'Pipelines'
      },
      {'route': 'contents', 'icon': Icons.perm_media, 'name': 'Contents'},
      {
        'route': Objects.Workflows,
        'icon': Icons.autorenew_rounded,
        'name': 'Workflows'
      },
    ],
    'CONFIGURATION': [
      {
        'route': 'organisation',
        'icon': Icons.business_rounded,
        'name': 'Organisation'
      },
      {'route': 'data', 'icon': Icons.storage_rounded, 'name': 'Data'},
    ]
  };

  static const valid = [
    'setup',
    'dashboard',
    'contacts',
    'accounts',
    'campaigns',
    'users',
    'activities',
    'opportunities',
    'products',
    'users',
    'campaigns',
    'pipelines',
    'contents',
    'workflows',
    'organisation',
    'data'
  ];

  static const construction = [
    'activities',
    'opportunities',
    'products',
    'users',
    'pipelines',
    'contents',
    'workflows',
    'organisation',
    'data'
  ];
}
