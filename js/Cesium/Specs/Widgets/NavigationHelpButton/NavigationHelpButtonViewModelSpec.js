defineSuite([
        'Widgets/NavigationHelpButton/NavigationHelpButtonViewModel'
    ], function(
        NavigationHelpButtonViewModel) {
    'use strict';

    it('Can construct', function() {
        var viewModel = new NavigationHelpButtonViewModel();
        expect(viewModel.showInstructions).toBe(false);
    });

    it('invoking command toggles showing', function() {
        var viewModel = new NavigationHelpButtonViewModel();
        expect(viewModel.showInstructions).toBe(false);

        viewModel.command();
        expect(viewModel.showInstructions).toBe(true);

        viewModel.command();
        expect(viewModel.showInstructions).toBe(false);
    });
});
